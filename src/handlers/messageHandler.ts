import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { getConfig } from '../helpers/configHelpers';
import { getRequiredPermissions } from '../helpers/permissionHelpers';

export async function handleMessageCreate(message: Message): Promise<void> {
  const clientUser = message.client.user;

  // Server outage
  if (!message.guild?.available) return;

  // Not logged in
  if (clientUser === null) return;

  const authorUser = message.author;
  const authorMember = message.member;
  const guild = message.guild;
  const channel = message.channel;

  if (message.system) return;
  if (authorUser.bot) return;
  if (!channel.isText()) return;
  if (message.hasThread) return;

  const config = getConfig();
  console.log('got to here: ', config?.threadChannels);
  if (!config?.threadChannels?.includes(channel.id)) return;

  console.log(message);

  const botMember = await guild.members.fetch(clientUser);
  const botPermissions = botMember.permissionsIn(message.channel.id);
  const requiredPermissions = getRequiredPermissions();
  if (!botPermissions.has(requiredPermissions)) {
    try {
      const missing = botPermissions.missing(requiredPermissions);
      const errorMessage = `Missing permission${
        missing.length > 1 ? 's' : ''
      }:`;
      await message.channel.send(
        `${errorMessage}\n    - ${missing.join('\n    - ')}`
      );
    } catch (e) {
      console.log(e);
    }
    return;
  }

  const creationDate = message.createdAt.toISOString().slice(0, 10);
  const authorName =
    authorMember === null || authorMember.nickname === null
      ? authorUser.username
      : authorMember.nickname;

  const thread = await message.startThread({
    name: `${authorName} (${creationDate})`,
    autoArchiveDuration: <60 | 1440 | 4320 | 10080 | 'MAX'>(
      config.threadArchiveDuration
    ),
  });

  const closeButton = new MessageButton()
    .setCustomId('close')
    .setLabel('Close thread')
    .setStyle('DANGER')
    .setEmoji('🗑️');

  const buttonRow = new MessageActionRow().addComponents(closeButton);

  const channelMention = `<#${channel.id}>`;
  const relativeTimestamp = `<t:${Math.round(
    message.createdTimestamp / 1000
  )}:R>`;

  await thread.send({
    content: `Hello <@${authorUser.id}>! This helpful thread has been automatically created from your message in ${channelMention} ${relativeTimestamp}.\n\nWant to unsubscribe from this thread? Right-click the thread (or use the \`...\` menu) and select **Leave Thread**.\n\nIf you are done using this thread, you can click the button below to close this thread.`,
    components: [buttonRow],
  });

  await thread.leave();
}
