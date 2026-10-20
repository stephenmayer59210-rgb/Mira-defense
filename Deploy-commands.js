
const { REST, Routes } = require("discord.js");
const commands = require("./commands.js");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error(
    "Il manque DISCORD_TOKEN, CLIENT_ID ou GUILD_ID."
  );
  process.exit(1);
}

const rest = new REST({ version: "10" }).setToken(token);

async function main() {
  try {
    console.log("Enregistrement des commandes...");

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log("Commandes enregistrées sur le serveur !");
  } catch (error) {
    console.error("Erreur d'enregistrement :", error.message);
  }
}

main();
