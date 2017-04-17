function TableRow(props){
return (
     <tr>
        <td>{props.processName}</td>
        <td>{props.pid}</td>
        <td>{props.userName}</td>
        <td>{props.cpuPercent}</td>
        <td>{props.memoryPercent}</td>
        <td>{props.residentMemory}</td>
        <td>{props.virtualMemory}</td>
    </tr>
);

};

TableRow.propTypes = {
        processName: React.PropTypes.string.isRequired,
        pid: React.PropTypes.number.isRequired,
        userName: React.PropTypes.string.isRequired,
        cpuPercent: React.PropTypes.number,
        memoryPercent: React.PropTypes.number.isRequired,
        residentMemory: React.PropTypes.number.isRequired,
        virtualMemory: React.PropTypes.number.isRequired,
    };



var LiveChart = React.createClass({
    
    propTypes: {
        chartSubtitle: React.PropTypes.string,
        dataTypeID: React.PropTypes.string.isRequired,
        dataTypeName: React.PropTypes.string.isRequired,
        newDataPoint: React.PropTypes.number.isRequired,
        lastUpdateTime: React.PropTypes.instanceOf(Date).isRequired,
        container: React.PropTypes.string.isRequired,
    },

    getDefaultProps: () => {
        return {
          chartSubtitle: null,  
        };
    },
    
    //invoked immediately before rendering when new props or state are being received.
    componentWillUpdate: function(nextProps){
        this.chart.setTitle(null, {text: this.props.chartSubtitle});
        var series = this.chart.get(this.props.dataTypeID)
        // Keep only 100 data points at most in the series
        var shift = series.data.length > 200;
        series.addPoint([nextProps.lastUpdateTime, nextProps.newDataPoint] , true, shift);
    },
    
   componentDidMount: function(){
        this.chart = new Highcharts.Chart({
            title: {
                text: this.props.dataTypeName,
                style: {
                    color: '#FF5733'
                }
            },
            subtitle: {
                text: this.props.chartSubtitle,
                style: {
                    color: '#FF5733'
                }
            },
            
            
            chart: {
                renderTo: this.props.container,
                defaultSeriesType: 'spline',
                backgroundColor: '#1F2739'
            },
            
            xAxis: {
                type: 'datetime',
            },
           
            series:[
                {
                    id: this.props.dataTypeID,
                    name: this.props.dataTypeName,
                    data: [],
                },
            ],
        });
    },

    // Destroy chart before unmount
    componentWillUnmount: function(){
        this.chart.destroy();
    },
    
    render: function(){
        return(
            <div id={this.props.container}> </div>
        );
    },

});


var Application = React.createClass({
    
    componentDidMount: function() {
        // make the Event source connection
        var source = new EventSource('http://localhost:8080/sub?id=system_stats');
        source.onmessage = this.onSystemStatUpdate;

    },
    
    onSystemStatUpdate: function(message){
          var data = JSON.parse(message.data)
          this.setState({
              processes:data.procs,
              loadAverage: data.load_average,
              memoryUsed: data.mem_used,
              totalAvailableMemory: Math.round(data.mem_total), 
              lastUpdateTime: new Date().getTime(),

          }) ;
    },
    
    getInitialState: function() {
        return ({
            processes: [],
            loadAverage: 0.0,
            memoryUsed: 0.0,
            lastUpdateTime:  new Date().getTime(),
        });
    },

    
    render: function(){
        return (
            <div>
            <div className="yellow"> PY TOP </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Process Name</th>
                        <th>PID</th>
                        <th>User Name</th>
                        <th>CPU Percent</th>
                        <th>Memory Percent</th>
                        <th>Resident Memory</th>
                        <th>Virtual Memory</th>
                    </tr>
                </thead>
                <tbody>
                {
                    this.state.processes.map(function(proc){
                        return (
                         <TableRow
                             processName={proc.name}
                             pid={proc.pid}
                             userName={proc.username}
                             cpuPercent={proc.cpu_percent}
                             memoryPercent={proc.memory_percent}
                             residentMemory={proc.resident_memory}
                             virtualMemory={proc.virtual_memory}/>
                        );
                    })
                }
                </tbody>
            </table>
            <LiveChart 
                className="liveChart"
                dataTypeID='load_average'
                dataTypeName='Load Average' 
                newDataPoint={this.state.loadAverage[0]}
                lastUpdateTime={this.state.lastUpdateTime}
                container='chartloadaverage' />
            
            <LiveChart 
                className="liveChart"
                dataTypeID='memory'
                dataTypeName='Total Memory Used(GB)' 
                chartSubtitle={'Available Memory(GB): ' + this.state.totalAvailableMemory}
                newDataPoint={this.state.memoryUsed}
                lastUpdateTime={this.state.lastUpdateTime}
                container='chartmemoryusage' />
            
            </div>
            
        );
    },
});



ReactDOM.render(<Application />, document.getElementById('container'));