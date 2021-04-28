if (typeof module !== 'undefined') {
    var binarytree = require('./binarytree'),
        bst = require('./bst.js'),
        rbt = require('./rbt.js'),
        heaptree = require('./heaptree.js'),
        heaparray = require('./heaparray.js');
} else {
    var scheduler = {},
        exports = scheduler;
}

function runScheduler(tasks, timeline, callback) {
    var time_queue = tasks.task_queue;
    var time_queue_idx = 0;

    var min_vruntime = 0;

    var running_task = null;


    var results = {time_data: []};
    var start_ms = new Date().getTime();
    binarytree.RESET_STATS();

    for(var curTime=0; curTime < tasks.total_time; curTime++) {
        if (curTime % 1000 === 0) {
        }
    
        var tresults = {running_task: null,
                        completed_task: null};

        while (time_queue_idx < time_queue.length &&
               (curTime >= time_queue[time_queue_idx].start_time)) {
            var new_task = time_queue[time_queue_idx++];
            new_task.vruntime = min_vruntime;
            new_task.truntime = 0;
            new_task.actual_start_time = curTime;
            timeline.insert(new_task);
        }

        if (running_task && (running_task.vruntime > min_vruntime)) {
            timeline.insert(running_task);
            running_task = null;
        }

        if (!running_task && timeline.size() > 0) {
            var min_node = timeline.min();
            running_task = min_node.val;
            timeline.remove(min_node);
            if (timeline.size() > 0) {
                min_vruntime = timeline.min().val.vruntime
            }
        }

        var task_done = false;
        if (running_task) {
            running_task.vruntime++;
            running_task.truntime++;
            tresults.running_task = running_task;
            if (running_task.truntime >= running_task.duration) {
                running_task.completed_time = curTime;
                tresults.completed_task = running_task
                task_done = true; 
            }
        }

        tresults.num_tasks = timeline.size() + (running_task ? 1 : 0);

        results.time_data[curTime] = tresults;
        if (callback) {
            callback(curTime, results);
        }

        if (task_done) {
            running_task = null;
        }
    }

    if (running_task) {
        timeline.insert(running_task);
    }

    results.node_stats = binarytree.GET_STATS();
    results.elapsed_ms = (new Date().getTime())-start_ms;

    return results;
}

function generateSummary(tasks, timeline, results) {
    var out = "", tnodes = [], hvals = [];
    timeline.reduce(null, function (_, node) {
        var task = node.val;
        tnodes.push(task.id + ":" + task.vruntime +
                    (node.color ? "/" + node.color : ""));
    }, "in");

    for (var i=0; i < results.time_data.length; i++) {
        var t = results.time_data[i];
        hvals.push(t.running_task ? t.running_task.id : "_");
    }
    out += "Timeline: ";
    out += tnodes.join(",");
    out += "\nTask history: ";
    out += hvals.join(",");
    out += "\n";
    return out;
    
}

function generateReport(tasks, timeline, results, mode) {
    var reads = 0, writes = 0, total = 0, completed = 0, out = "";

    switch (mode) {
    case 'summary': case 'csv': case 'report': case 'detailed': break;
    default:
        throw new Error("Unknown reporting mode '" + mode + "'");
    }


    if (mode === "summary" ) {
        return generateSummary(tasks, timeline, results);
    }

    if (mode === 'detailed') {
        out += "Task Queue:\n";
        for (var i=0; i < tasks.task_queue.length; i++) {
            var t = tasks.task_queue[i];
            out += t.id + " " + t.start_time + " " + t.duration + "\n";
        }
    }

    if (mode === 'detailed') {
        out += "\ntime [tasks]: running_task, completed\n";
    }
    for (var i=0; i < results.time_data.length; i++) {
        var t = results.time_data[i],
            msg = "  " + i + "   [" + t.num_tasks + "]: \t";
        if (t.running_task) {
            msg += t.running_task.id;
        }
        if (t.completed_task) {
            msg += ", Completed";
            completed++;
        }
        if (mode === 'detailed') {
            out += msg + "\n";
        }
    }

    for (var r in results.node_stats.read) {
        reads += results.node_stats.read[r];
    }
    for (var r in results.node_stats.write) {
        writes += results.node_stats.write[r];
    }
    total = reads+writes;

    if (mode === 'csv') {
        out += tasks.num_of_tasks + ",";
        out += tasks.total_time + ",";
        out += completed + ",";

        out += results.elapsed_ms + ",";
        out += reads + ",";
        out += writes + ",";
        out += total + ",";
        out += (completed/results.elapsed_ms) + ",";
        out += (completed/total);
    } else {
        out += "Total Tasks: " + tasks.num_of_tasks + "\n";
        out += "Total Time: " + tasks.total_time + "\n";
        out += "Completed Tasks: " + completed + "\n";

        out += "Wallclock elapsed time: " + results.elapsed_ms + "ms\n";
        out += "Node operations reads  : " + reads + "\n";
        out += "                writes : " + writes + "\n";
        out += "                total  : " + total + "\n";
        out += "Throughput: " + (completed/results.elapsed_ms) + " completed tasks/ms\n";
        out += "            " + (completed/total) + " completed tasks/operation\n";
    }

    return out;
}

function getTimelineByName(name) {
    function vsort(a,b) {
            return a.val.vruntime - b.val.vruntime;
    }

    var timeline;
    switch (name.toLowerCase()) {
    case 'bst':       timeline = new bst.BST(vsort); break;
    case 'rbt':       timeline = new rbt.RBT(vsort); break;
    case 'heaptree':  timeline = new heaptree.HeapTree('min', vsort); break;
    case 'heaparray': timeline = new heaparray.HeapArray('min', vsort); break;
    default:          throw new Error("Unknown timeline name '" + name + "'");
    }
    return timeline;
}

function usage() {
    console.log("node scheduler.js [--summary|--csv|--report|--detailed] bst|rbt|heaptree|heaparray TASK_FILE");
    process.exit(2);
}    

if (typeof require !== 'undefined' && require.main === module) {
    if (process.argv.length < 4) {
        usage();
    }

    var fs = require('fs');
    var tasksModule = require('./tasks');
    var mode = "summary";

    if (process.argv[2].slice(0,2) === "--") {
        mode = process.argv[2].slice(2);
        process.argv.splice(2,1);
    }

    var timeline = getTimelineByName(process.argv[2]);
    var fileName = process.argv[3];
    var data = fs.readFileSync(fileName, 'utf8');
    var tasks = tasksModule.parseTasks(data);

    var results = runScheduler(tasks, timeline);

    if (mode === 'csv') {
        console.log("total_tasks,total_time,completed_tasks,elapsed_ms,read_ops,write_ops,total_ops,tasks/ms,tasks/op");
    } else if (mode !== 'summary') {
        console.log("Running with:", timeline.name);
    }
    console.log(generateReport(tasks, timeline, results, mode));
} else {
    exports.runScheduler = runScheduler;
    exports.generateReport = generateReport;
    exports.getTimelineByName = getTimelineByName;
}
