const inquirer = require("inquirer");
const ngrok = require("ngrok");
const https = require("follow-redirects").https;
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const terminalImage = require("terminal-image");
const open = require("open");
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
    ready: false,
    ip: "Please Wait..."
};

if (!fs.existsSync(path.join(process.cwd(), "/PenguiPanelFiles"))) {
    createServer();
} else {
    mainMenu();
}

function mainMenu() {
    console.clear();
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
                penguiPanelOpts();
                break;
        }
    });
}

function createServer() {
    console.clear();
    console.log(SERVER_ART);
    console.log("Welcome to PenguiPanel Server Creation Wizard!\n");
    console.log("By creating a server with the help of this software, you agree to the Minecraft EULA (https://www.minecraft.net/en-us/eula)\n");

    inquirer.prompt([
        {
            type: "list",
            name: "software",
            message: "Select a server software.",
            choices: ["Paper", "Purpur", "Vanilla", "MohistMC"]
        },
        {
            type: "input",
            name: "version",
            message: "Enter a version (can be 'latest')."
        },
        {
            type: "input",
            name: "ram",
            message: "How much ram should be allocated? (default 2048)"
        }
    ]).then(answers => {
        if(!answers.version) exit();
        let url = `https://mc-srv-dl-api.pingwinco.xyz/download/${answers.software.toLowerCase()}/${answers.version}/latest`;

        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles"));
        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles"));
        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), "{}", "utf8");
        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/eula.txt"), "eula=true", "utf8");

        fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
            if (err) {
                console.log(chalk.red(`Oops! An error has occurred: ${err}.`));
                exit();
            }

            let contents = JSON.parse(data);
            contents.software = answers.software.toLowerCase();
            contents.ram = answers.ram || "2048";

            fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));

            console.log(`Downloading ${answers.software}...`);

            const file = fs.createWriteStream(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/server.jar"));
            https.get(url, response => {
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    console.clear();
                    mainMenu();
                });
            });
        });
    });
}

function startServer() {
    console.log(chalk.green("The server is starting! Server statistics will appear here."));
    console.log(chalk.yellow("If you are starting a server for the first time, it may take a while for the java control window to open."));

    const server = exec(`cd ${path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles")} && java -jar server.jar`, (error, stdout, stderr) => {
        if (error) {
            console.error(chalk.red(`Oops! An error has occurred while starting the server: ${error}`));
            exit();
        }
    });

    const authtoken = JSON.parse(fs.readFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), "utf8")).ngrok;
    
    if(authtoken) {
        ngrok.connect({
            authtoken: authtoken,
            proto: "tcp",
            addr: 25565
        }).then((url) => {
            stats.ip = url.slice(6);
            displayInfo();
        });
    } else {
        stats.ip = "N/A";
        displayInfo();
    }
    
    server.stdout.on("data", (data) => {
        if(data.includes("Done")) {
            stats.ready = true;
        }

        if (data.includes("joined the game")) {
            stats.playersOnline++;
        }
        if (data.includes("left the game")) {
            stats.playersOnline--;
        }

        displayInfo();
    });

    setInterval(() => {
        stats.uptime += 1;
        displayInfo();
    }, 60000); 
}

function pluginsMenu() {
    console.clear();
    console.log(SERVER_ART);
    console.log("Welcome to the PenguiPanel Plugins Menu!")
    if(JSON.parse(fs.readFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), "utf8")).software === "vanilla") return console.log(chalk.red("Oops! You are using the vanilla server software, which does not support plugins.")), exit();

    inquirer.prompt({
        type: "list",
        name: "action",
        message: "Please select an option:",
        choices: [
            "Install Plugin",
            "Remove Plugin"
        ]
    }).then(answers => {
        if(answers.action === "Install Plugin") {
            inquirer.prompt({
                type: "input",
                name: "plugin",
                message: "Plugin name:"
            }).then(answers => {
                if(!answers.plugin) exit();

                fetch(`https://api.spiget.org/v2/search/resources/${answers.plugin}`)
                .then(results => results.json())
                .then(async data => {
                    if(data.length === 0) return console.log(chalk.red("No Plugins With That Name Could Be Found!")), exit();

                    if(data[0].icon.data) console.log("\n" + await terminalImage.buffer(Buffer.from(data[0].icon.data, "base64"), { width: 25, height: 25 }));
                    console.log(`Name: ${data[0].name}\nDescription: ${data[0].tag}\nRating: ${data[0].rating.average}\nTested Versions: ${data[0].testedVersions.length !== 0 ? data[0].testedVersions : "N/A" }`);

                    inquirer.prompt({
                        type: "confirm",
                        name: "validation",
                        message: "Is this the correct plugin?"
                    }).then((answers) => {
                        if(answers.validation === true) {
                            console.log(chalk.green("Downloading plugin..."));

                            if(!fs.existsSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/plugins"))) fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/plugins"));
                            const file = fs.createWriteStream(path.join(process.cwd(), `/PenguiPanelFiles/ServerFiles/plugins/${data[0].name.replace(/[^a-zA-Z ]/g, "")}.jar`));
                                https.get(`https://api.spiget.org/v2/resources/${data[0].id}/download`, response => {
                                    response.pipe(file);
                                    file.on("finish", () => {
                                        file.close();
                                        console.clear();
                                        mainMenu();
                                    });
                            });
                        } else if(answers.validation === false) {
                            return console.log(chalk.red("Aborting")), exit();
                        }
                    });
                });
            });
        } else if(answers.action === "Remove Plugin") {
            const plugins = [];

            fs.readdirSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/plugins")).forEach((file) => {
                plugins.push(file);
            });

            if(plugins.length === 0) return console.log(chalk.red("There are no plugins to remove!")), exit();

            inquirer.prompt({
                type: "list",
                name: "plugin",
                message: "Which plugin would you like to delete?",
                choices: plugins
            }).then((answers) => {
                fs.unlinkSync(path.join(process.cwd(), `/PenguiPanelFiles/ServerFiles/plugins/${answers.plugin}`));
                console.clear();
                mainMenu();
            });
        }
    });
}

function penguiPanelOpts() {
    console.clear();
    console.log(SERVER_ART);
    console.log("Welcome to the PenguiPanel Options Menu!");

    inquirer.prompt({
        type: "list",
        name: "settings",
        message: "Please select an option:",
        choices: [
            "Edit The Server Properties File",
            "Set-Up Port Forwarding",
            "Backup/Restore From Dropbox",
            "Change Amount of RAM Allocated",
            "Check for Updates"
        ]
    }).then(answers => {
        switch(answers.settings) {
            case "Edit The Server Properties File":
                open(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/server.properties"), { wait: true }).then(() => {
                    mainMenu();
                });
                break;
            case "Set-Up Port Forwarding":
                portForwardingSetup();
                break;
        };
    });
}

function portForwardingSetup() {
    inquirer.prompt({
        type: "input",
        name: "ngrok",
        message: "Enter your Ngrok authentication token.",
    }).then(answers => {
        fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
            if (err) {
                console.log(chalk.red(`Oops! An error has occurred: ${err}.`));
                exit();
            }

            let contents = JSON.parse(data);
            contents.ngrok = answers.ngrok;
            fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));
            mainMenu();
        });
    });
}

function displayInfo() {
    console.clear();
    console.log(SERVER_ART);
    console.log("Server Statistics:\n");
    console.table({
        "Ready": stats.ready,
        "IP address": stats.ip,
        "Uptime (minutes)": stats.uptime,
        "Players Online": stats.playersOnline
    });
}

function exit() {
    console.log(chalk.red("Press any key to continue..."));

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", process.exit.bind(process, 0));
}