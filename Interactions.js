
const { PermissionFlagsBits } = require("discord.js");

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;

  if (!["ban", "kick", "timeout"].includes(commandName)) {
    return;
  }

  if (!interaction.inGuild()) {
    return interaction.reply({
      content: "Cette commande doit être utilisée sur un serveur.",
      ephemeral: true
    });
  }

  const user = interaction.options.getUser("membre");
  const member = interaction.options.getMember("membre");
  const reason =
    interaction.options.getString("raison") || "Aucune raison donnée";

  if (!user || !member) {
    return interaction.reply({
      content: "Membre introuvable.",
      ephemeral: true
    });
  }

  if (user.id === interaction.user.id) {
    return interaction.reply({
      content: "Tu ne peux pas utiliser cette commande sur toi-même.",
      ephemeral: true
    });
  }

  if (user.id === interaction.client.user.id) {
    return interaction.reply({
      content: "Je ne peux pas appliquer cette commande sur moi-même.",
      ephemeral: true
    });
  }

  try {
    if (commandName === "ban") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({
          content: "Tu n'as pas la permission de bannir.",
          ephemeral: true
        });
      }

      await member.ban({ reason });
      return interaction.reply({
        content: `🔨 ${user.tag} a été banni. Raison : ${reason}`
      });
    }

    if (commandName === "kick") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({
          content: "Tu n'as pas la permission d'expulser.",
          ephemeral: true
        });
      }

      await member.kick(reason);
      return interaction.reply({
        content: `👢 ${user.tag} a été expulsé. Raison : ${reason}`
      });
    }

    if (commandName === "timeout") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({
          content: "Tu n'as pas la permission de mettre en timeout.",
          ephemeral: true
        });
      }

      const minutes = interaction.options.getInteger("minutes");

      if (!minutes || minutes < 1 || minutes > 10080) {
        return interaction.reply({
          content: "La durée doit être entre 1 et 10080 minutes.",
          ephemeral: true
        });
      }

      await member.timeout(minutes * 60 * 1000, reason);
      return interaction.reply({
        content: `⏳ ${user.tag} est en timeout pour ${minutes} minute(s). Raison : ${reason}`
      });
    }
  } catch (error) {
    console.error(`Erreur /${commandName} :`, error);

    return interaction.reply({
      content: "❌ Action impossible. Vérifie les permissions et le rôle du bot.",
      ephemeral: true
    });
  }
}

module.exports = { handleInteraction };
