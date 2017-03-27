
var Table = ReactBootstrap.Table;


function ProcessRow(props){
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

ProcessRow.propTypes = {
        processName: React.PropTypes.string.isRequired,
        pid: React.PropTypes.number.isRequired,
        userName: React.PropTypes.string.isRequired,
        cpuPercent: React.PropTypes.number,
        memoryPercent: React.PropTypes.number.isRequired,
        residentMemory: React.PropTypes.number.isRequired,
        virtualMemory: React.PropTypes.number.isRequired,
    };



var Application = React.createClass({
    
    componentDidMount: function() {
        // make the Event source connection
        var source = new EventSource('http://localhost:8080/sub?id=system_stats');
        source.onmessage = this.onSystemStatUpdate;

    },
    
    onSystemStatUpdate: function(message){
          this.setState({
              processes:JSON.parse(message.data), 
          }) ;
    },
    
    getInitialState: function() {
        return ({
            processes: [],
        });
    },

    
    render: function(){
        return (
            <div>
            <div> PY TOP </div>
            <Table striped bordered condensed hover>
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
                         <ProcessRow
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
            </Table>
            </div>
        );
    },
});



ReactDOM.render(<Application />, document.getElementById('container'));