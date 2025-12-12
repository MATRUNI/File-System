const { exec } = require("child_process");

exec('du -ah --max-depth=1 /home/himanshu-yadav/Desktop', (err, stdout) => {
    if (err) throw err;
    const lines = stdout.trim().split("\n");
    const results = lines.map(line => {
        const [size, path] = line.split(/\s+/);
        return { size, path };
    });
    console.log(results);
});
