const inquirer = require("inquirer");
const ngrok = require("ngrok");
const fetch = require("node-fetch");
const https = require("https");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

if(!fs.existsSync(path.join(process.cwd(), "/PenguiPanelFiles"))) {
    createServer();
} else {
    mainMenu();
}

function mainMenu() {

console.log(`
██████╗░███████╗███╗░░██╗░██████╗░██╗░░░██╗██╗██████╗░░█████╗░███╗░░██╗███████╗██╗░░░░░
██╔══██╗██╔════╝████╗░██║██╔════╝░██║░░░██║██║██╔══██╗██╔══██╗████╗░██║██╔════╝██║░░░░░
██████╔╝█████╗░░██╔██╗██║██║░░██╗░██║░░░██║██║██████╔╝███████║██╔██╗██║█████╗░░██║░░░░░
██╔═══╝░██╔══╝░░██║╚████║██║░░╚██╗██║░░░██║██║██╔═══╝░██╔══██║██║╚████║██╔══╝░░██║░░░░░
██║░░░░░███████╗██║░╚███║╚██████╔╝╚██████╔╝██║██║░░░░░██║░░██║██║░╚███║███████╗███████╗
╚═╝░░░░░╚══════╝╚═╝░░╚══╝░╚═════╝░░╚═════╝░╚═╝╚═╝░░░░░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝╚══════╝
Welcome to PenguiPanel v1.0.0!
`);

inquirer
    .prompt({
        type: "list",
        name: "menuopts",
        message: "Select an option.",
        choices: [
            "Start Server",
            "Plugins Menu",
            "PenguiPanel Options"
        ]
    })
    .then((answers) => {
        if(answers.menuopts === "Start Server") {
            startServer();
        }
        if(answers.menuopts === "Plugins Menu") {
            pluginsMenu();
        }
        if(answers.menuopts === "PenguiPanel Options") {
            penguipanelOpts();
        }
    });

}

function createServer() {

console.log(`
██████╗░███████╗███╗░░██╗░██████╗░██╗░░░██╗██╗██████╗░░█████╗░███╗░░██╗███████╗██╗░░░░░
██╔══██╗██╔════╝████╗░██║██╔════╝░██║░░░██║██║██╔══██╗██╔══██╗████╗░██║██╔════╝██║░░░░░
██████╔╝█████╗░░██╔██╗██║██║░░██╗░██║░░░██║██║██████╔╝███████║██╔██╗██║█████╗░░██║░░░░░
██╔═══╝░██╔══╝░░██║╚████║██║░░╚██╗██║░░░██║██║██╔═══╝░██╔══██║██║╚████║██╔══╝░░██║░░░░░
██║░░░░░███████╗██║░╚███║╚██████╔╝╚██████╔╝██║██║░░░░░██║░░██║██║░╚███║███████╗███████╗
╚═╝░░░░░╚══════╝╚═╝░░╚══╝░╚═════╝░░╚═════╝░╚═╝╚═╝░░░░░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝╚══════╝
Welcome to PenguiPanel Server Creation Wizard!
By creating a server with the help of this software, you agree to the Minecraft EULA (https://www.minecraft.net/en-us/eula)
`);

inquirer
    .prompt([
        {
            type: "list",
            name: "softwarechoice",
            message: "Select a server software.",
            choices: [
                "Paper",
                "Purpur",
                "Vanilla",
                "MohistMC"
            ]
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
    ])
    .then((answers) => {
        if(!answers.versionchoice || !answers.ramamount) {
            return console.log("\x1b[31m", "The version and amount of RAM is required.") 
        }


        if(isNaN(parseInt(answers.ramamount))) {
            return console.log("\x1b[31m", "The RAM amount must be a number!")
        }

        answers.softwarechoice = answers.softwarechoice.toLowerCase();

        url = `https://mc-srv-dl-api.pingwinco.xyz/download/${answers.softwarechoice}/${answers.versionchoice}/latest`;

        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles"));

        fs.mkdirSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles"));
    
        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), "{}", "utf8");

        fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/eula.txt"), "eula=true", "utf8");

        fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
            if(err) {
                console.log("\x1b[31m", `Oops! An error has occurred: ${err}.`);
            }
    
            let contents = JSON.parse(data);
    
            contents.software = answers.softwarechoice;
            contents.version = answers.versionchoice;
            contents.ram = answers.ramamount;
    
            fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));
        });

        console.log(`Downloading ${answers.softwarechoice}...`);

        const file = fs.createWriteStream(path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles/server.jar"));
        const request = https.get(url, (response) => {
            response.pipe(file);

            file.on("finish", () => {
                file.close();
                console.log("Finished Downloading The Server!");
                mainMenu();
            });
        });
    });
}

function startServer() {
    exec("java --version", (err) => {
        if(err) {
            console.log("\x1b[31m", "ERR! Java could not be located on your system. Press any key to continue...");
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.on("data", process.exit.bind(process, 0));
        } else {
            fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), async (err, data) => {
                if(err) {
                    console.log("\x1b[31m", `Oops! An error has occurred: ${err}.`);
                }

                let contents = JSON.parse(data);

                if(contents.ngrok) {
                    const url = await ngrok.connect({authtoken: contents.ngrok, proto: "tcp", addr: 25565}).catch(err => console.log(err));
                    //cut off tcp://
                    console.log("\x1b[32m", `Ngrok IP: ${url.slice(6)}`);
                }

                server = exec(`cd ${path.join(process.cwd(), "/PenguiPanelFiles/ServerFiles")} && java -Xmx${contents.ram}M -Xms${contents.ram}M -jar server.jar`);   
                console.log("\x1b[32m", "The server is starting! A pop-up menu will appear soon. Server statistics will appear here.");

                let playerCount = 0;
                console.log(`Players online: ${playerCount}`);

                server.stdout.on("data", (data) => {
                    //Handle statistics
                    if (data.includes("joined the game")) {
                        playerCount++;
                        updatePlayerCount();
                    }
                
                    if (data.includes("left the game")) {
                        playerCount--;
                        updatePlayerCount();
                    }
                });

                function updatePlayerCount() {
                    process.stdout.write("\x1b[F\x1b[K");
                    console.log(`Players online: ${playerCount}`);
                }
            });
        }
  });
}

function penguipanelOpts() {
    inquirer
        .prompt({
            type: "list",
            name: "settingsmenu",
            message: "Please select an option:",
            choices: [
                "Set-Up Port Forwarding",
                "Backup To Drive/Upload Backup",
                "Change amount of ram allocated",
                "Check for updates"
            ]
        })
        .then((answers) => {
            if(answers.settingsmenu === "Set-Up Port Forwarding") {
                portForwardingSetup();
            }
        });
}

function portForwardingSetup() {
    inquirer
        .prompt({
            type: "input",
            name: "ngroktoken",
            message: "Enter your Ngrok authentication token.",
        })
        .then((answers) => {
            fs.readFile(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), (err, data) => {
                if(err) {
                    console.log("\x1b[31m", `Oops! An error has occurred: ${err}.`);
                }

                let contents = JSON.parse(data);

                contents.ngrok = answers.ngroktoken;

                fs.writeFileSync(path.join(process.cwd(), "/PenguiPanelFiles/PenguiPanelConfig.json"), JSON.stringify(contents, null, 2));

                mainMenu();
            });
        });
}

function pluginsMenu() {
    console.log("\x1b[32m", "Welcome to the PenguiPanel plugins menu!\n Powered by Paper Hangar and Spiget.");
}