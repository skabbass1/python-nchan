
var Table = ReactBootstrap.Table;

var Application = React.createClass({
    
    componentDidMount: function() {
        // make the Event source connection
        var source = new EventSource('http://localhost:8080/sub?id=system_stats');
        source.onmessage = this.onSystemStatUpdate;

    },
    
    onSystemStatUpdate: function(message){
          console.log(JSON.parse(message.data));  
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
                   
                </tbody>
            </Table>
            </div>
        );
    },
});



ReactDOM.render(<Application />, document.getElementById('container'));