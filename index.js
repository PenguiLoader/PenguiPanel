const inquirer = require("inquirer");
const ngrok = require("ngrok");
const https = require("follow-redirects").https;
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const SERVER_ART = `
██████╗░███████╗███╗░░██╗░██████╗░██╗░░░██╗██╗██████╗░░█████╗░███╗░░██╗███████╗██╗░░░░░
██╔══██╗██╔════╝████╗░██║██╔════╝░██║░░░██║██║██╔══██╗██╔══██╗████╗░██║██╔════╝██║░░░░░
██████╔╝█████╗░░██╔██╗██║██║░░██╗░██║░░░██║██║██████╔╝███████║██╔██╗██║█████╗░░██║░░░░░
██╔═══╝░██╔══╝░░██║╚████║██║░░╚██╗██║░░░██║██║██╔═══╝░██╔══██║██║╚████║██╔══╝░░██║░░░░░
██║░░░░░███████╗██║░╚███║╚██████╔╝╚██████╔╝██║██║░░░░░██║░░██║██║░╚███║███████╗███████╗
╚═╝░░░░░╚══════╝╚═╝░░╚══╝░╚═════╝░░╚═════╝░╚═╝╚═╝░░░░░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝╚══════╝
`;

const stats = {
    uptime: 0,
    playersOnline: 0,
};

if (!fs.existsSync(path.join(process.cwd(), "/PenguiPanelFiles"))) {
    createServer();
} else {
    mainMenu();
}

function mainMenu() {
    console.log(SERVER_ART);
    console.log("Welcome to PenguiPanel v1.0.0!\n");

    inquirer.prompt({
        type: "list",
        name: "menuopts",
        message: "Select an option.",
        choices: [
            "Start Server",
            "Plugins Menu",
            "PenguiPanel Options"
        ]
    }).then(answers => {
        switch (answers.menuopts) {
            case "Start Server":
                startServer();
                break;
            case "Plugins Menu":
                pluginsMenu();
                break;
            case "PenguiPanel Options":
                penguipanelOpts();
                break;
        }
    });
}

function createServer() {
    console.log(SERVER_ART);
    console.log("Welcome to PenguiPanel Server Creation Wizard!\n");
    console.log("By creating a server with the help of this software, you agree to the Minecraft EULA (https://www.minecraft.net/en-us/eula)\n");

    inquirer.prompt([
        {
            type: "list",
            name: "softwarechoice",
            message: "Select a server software.",
            choices: ["Paper", "Purpur", "Vanilla", "MohistMC"]
        },
        {
            type: "input",
            name: "versionchoice",
            message: "Enter a version (can be 'latest')."
        },
        {
            type: "input",
            name: "ramamount",
            message: "How much ram should be allocated? (default 2048)"
        }
    ]).then(answers => {
        let url = `https://mc-srv-dl-api.pingwinco.xyz/download/${answers.softwarechoice.toLowerCase()}/${answers.versionchoice}/latest`;

        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles"));
        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles"));
        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), "{}", "utf8");
        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/eula.txt"), "eula=true", "utf8");

        fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
            if (err) {
                console.log("\x1b[31m", `Oops! An error has occurred: ${err}.`);
            }

            let contents = JSON.parse(data);
            contents.software = answers.softwarechoice.toLowerCase();
            contents.version = answers.versionchoice;
            contents.ram = answers.ramamount;

            fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));

            console.log(`Downloading ${answers.softwarechoice}...`);

            const file = fs.createWriteStream(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/server.jar"));
            const request = https.get(url, response => {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.log("Finished Downloading The Server!");
                    mainMenu();
                });
            });
        });
    });
}

function startServer() {
    console.log("\x1b[32m", "The server is starting! Server statistics will appear here.");
    console.log("\x1b[0m");

    const server = exec(`cd ${path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles")} && java -jar server.jar`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`Server Output: ${stdout}`);
    });

    server.stdout.on("data", (data) => {
        if(data.includes("Done")) {
            server.stdin.write("tps\n");
        }
        if (data.includes("joined the game")) {
            stats.playersOnline++;
        }
        if (data.includes("left the game")) {
            stats.playersOnline--;
        }
        displayStats();
    });

    setInterval(() => {
        stats.uptime += 1;
        displayStats();
    }, 60000); 
}

function pluginsMenu() {
    console.log("Welcome to the PenguiPanel plugins menu!");
}

function penguipanelOpts() {
    inquirer.prompt({
        type: "list",
        name: "settingsmenu",
        message: "Please select an option:",
        choices: [
            "Set-Up Port Forwarding",
            "Backup To Drive/Upload Backup",
            "Change amount of ram allocated",
            "Check for updates"
        ]
    }).then(answers => {
        if (answers.settingsmenu === "Set-Up Port Forwarding") {
            portForwardingSetup();
        }
    });
}

function portForwardingSetup() {
    inquirer.prompt({
        type: "input",
        name: "ngroktoken",
        message: "Enter your Ngrok authentication token.",
    }).then(answers => {
        fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
            if (err) {
                console.log("\x1b[31m", `Oops! An error has occurred: ${err}.`);
            }

            let contents = JSON.parse(data);
            contents.ngrok = answers.ngroktoken;
            fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));
            mainMenu();
        });
    });
}

function displayStats() {
    console.clear();
    console.log(SERVER_ART);
    console.log("Server Statistics:\n");
    console.table({
        "Uptime (minutes)": stats.uptime,
        "Players Online": stats.playersOnline
    });
}
