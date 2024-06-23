const yargs = require('yargs');
const fs = require('fs');

// Load tasks from the JSON file
const loadTasks = () => {
  try {
    const data = fs.readFileSync('tasks.json');
    return JSON.parse(data);
  } catch (error) {
    return { tasks: [] };
  }
};

let taskIdCounter ; // Initialize a counter for task IDs

// Save tasks to the JSON file
const saveTasks = (tasks) => {
  fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
};

yargs
  .command('add <description>', 'Add a new task', (yargs) => {
    yargs.positional('description', {
      describe: 'Task description',
      type: 'string',
    });
  }, (argv) => {
    const tasks = loadTasks();
    taskIdCounter = tasks.tasks.length > 0 ? Math.max(...tasks.tasks.map(task => task.id)) + 1 : 1;
    const newTask = {
      id: taskIdCounter++, // Assign a unique ID and increment the counter
      description: argv.description,
      status: 'Incomplete',
    };
    tasks.tasks.push(newTask);
    saveTasks(tasks);
    console.log(`Task "${newTask.description}" is added to the list.`);
  })
  .command('list', 'List all tasks', (yargs) => {}, (argv) => {
    const tasks = loadTasks();
    console.log('ID Description Status');
    tasks.tasks.forEach((task) => {
      console.log(`${task.id} ${task.description} ${task.status}`);
    });
  })
  .command('edit <id> <description>', 'Edit a task', (yargs) => {
    yargs.positional('id', {
      describe: 'Task ID',
      type: 'number',
    }).positional('description', {
      describe: 'Task description',
      type: 'string',
    });
  }, (argv) => {
    const tasks = loadTasks();
    const task = tasks.tasks.find((t) => t.id === argv.id);
    if (task) {
      task.description = argv.description;
      saveTasks(tasks);
      console.log(`Task ${task.id} edited: "${task.description}"`);
    } else {
      console.log(`Task with ID ${argv.id} not found.`);
    }
  })
  .command('complete <id>', 'Mark a task as complete', (yargs) => {
    yargs.positional('id', {
      describe: 'Task ID',
      type: 'number',
    });
  }, (argv) => {
    const tasks = loadTasks();
    const task = tasks.tasks.find((t) => t.id === argv.id);
    if (task) {
      task.status = 'Complete';
      saveTasks(tasks);
      console.log(`Task "${task.description}" is marked as completed.`);
    } else {
      console.log(`Task with ID ${argv.id} not found.`);
    }
  })
  .command('search <keyword>', 'Search for tasks containing a keyword', (yargs) => {
    yargs.positional('keyword', {
      describe: 'Keyword to search for',
      type: 'string',
    });
  }, (argv) => {
    const tasks = loadTasks();
    const matchingTasks = tasks.tasks.filter((task) =>
      task.description.toLowerCase().includes(argv.keyword.toLowerCase())
    );
    if (matchingTasks.length > 0) {
      console.log('ID Description Status');
      matchingTasks.forEach((task) => {
        console.log(`${task.id} ${task.description} ${task.status}`);
      });
    } else {
      console.log('No task found.');
    }
  })
  .help()
  .argv;