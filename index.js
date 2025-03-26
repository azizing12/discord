const { Client, IntentsBitField, Partials, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// إعداد عميل Discord
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.DirectMessageReactions,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
  ],
});

// متغيرات البيئة
const prefix = process.env.PREFIX || '+'; // افتراضياً '+' إذا لم يتم تحديده
const ALLOWED_USER = process.env.ALLOWED_USER; // المستخدم المسموح له باستخدام أوامر البث

// حالة البوت عند الجاهزية
client.once('ready', async () => {
  console.log('Bot is Ready!');
  console.log('Code by AbuTurki');
  console.log('discord.gg/AbuTurki');
  client.user.setActivity(' AbuTurki');
  client.user.setStatus('online');

  // تسجيل الأوامر الشرطة المائلة (/)
  const commands = [
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('يرسل Ping للبوت'),
    new SlashCommandBuilder()
      .setName('help')
      .setDescription('يعرض قائمة الأوامر المتاحة'),
    new SlashCommandBuilder()
      .setName('bc')
      .setDescription('يرسل رسالة لجميع الأعضاء')
      .addStringOption(option =>
        option.setName('message')
          .setDescription('الرسالة المراد إرسالها')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('rolebc')
      .setDescription('يرسل رسالة لأعضاء رتبة معينة')
      .addRoleOption(option =>
        option.setName('role')
          .setDescription('الرتبة المراد إرسال الرسالة لها')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('message')
          .setDescription('الرسالة المراد إرسالها')
          .setRequired(true)),
    new SlashCommandBuilder()
      .setName('bcrandom')
      .setDescription('يرسل رسالة إلى عدد عشوائي من الأعضاء')
      .addIntegerOption(option =>
        option.setName('count')
          .setDescription('عدد الأعضاء المراد إرسال الرسالة لهم')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('message')
          .setDescription('الرسالة المراد إرسالها')
          .setRequired(true)),
  ].map(command => command.toJSON());

  await client.application.commands.set(commands);
  console.log('تم تسجيل الأوامر الشرطة المائلة (/) بنجاح!');
});

// التعامل مع الأوامر باستخدام البادئة (+)
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix)) return; // تجاهل الرسائل التي لا تبدأ بالبادئة
  if (message.author.bot) return; // تجاهل رسائل البوتات

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    const timeTaken = Date.now() - message.createdTimestamp;
    await message.reply(`\`\`\`javascript\nDiscord API: ${Math.round(client.ws.ping)} ms\nTime taken: ${timeTaken} ms\n\`\`\``);
  }

  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Help Menu')
      .setColor('#a4c8fd')
      .setFooter({ text: `${message.author.tag}`, iconURL: `${message.author.displayAvatarURL({ dynamic: true })}` })
      .setTimestamp()
      .setDescription(
        `**__Commands__**  
        ـــــــــــــــــــــــــ
        **Main Cmds**
        ${prefix}ping 
        ${prefix}support
        ـــــــــــــــــــــــــ
        **BroadCast Cmds**
        ${prefix}bc  <- ALL
        ${prefix}rolebc <- Role specific
        ${prefix}bcrandom <- Random members
        ـــــــــــــــــــــــــ
        By : AbuTurki
        Studio AbuTurki **|** [**Support Server**](https://discord.gg/AbuTurki)`
      );
    await message.reply({ embeds: [helpEmbed] });
  }

  if (command === 'bc') {
    await handleBcCommand(message, args.join(' '));
  }

  if (command === 'rolebc') {
    const role = message.mentions.roles.first();
    if (!role) return message.reply('الرجاء تحديد الرتبة.');
    await handleRoleBcCommand(message, role, args.slice(1).join(' '));
  }

  if (command === 'bcrandom') {
    const count = parseInt(args[0]);
    if (isNaN(count) || count <= 0) return message.reply('الرجاء إدخال عدد صحيح موجب.');
    const messageContent = args.slice(1).join(' ');
    await handleBcRandomCommand(message, count, messageContent);
  }
});

// التعامل مع الأوامر الشرطة المائلة (/)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'ping') {
    const timeTaken = Date.now() - interaction.createdTimestamp;
    await interaction.reply(`\`\`\`javascript\nDiscord API: ${Math.round(client.ws.ping)} ms\nTime taken: ${timeTaken} ms\n\`\`\``);
  }

  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('Help Menu')
      .setColor('#a4c8fd')
      .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true })}` })
      .setTimestamp()
      .setDescription(
        `**__Commands__**  
        ـــــــــــــــــــــــــ
        **Main Cmds**
        /ping 
        /support
        ـــــــــــــــــــــــــ
        **BroadCast Cmds**
        /bc  <- ALL
        /rolebc <- Role specific
        /bcrandom <- Random members
        ـــــــــــــــــــــــــ
        By : AbuTurki
        Studio AbuTurki **|** [**Support Server**](https://discord.gg/AbuTurki)`
      );
    await interaction.reply({ embeds: [helpEmbed] });
  }

  if (commandName === 'bc') {
    const messageContent = options.getString('message');
    await handleBcCommand(interaction, messageContent);
  }

  if (commandName === 'rolebc') {
    const role = options.getRole('role');
    const messageContent = options.getString('message');
    await handleRoleBcCommand(interaction, role, messageContent);
  }

  if (commandName === 'bcrandom') {
    const count = options.getInteger('count');
    const messageContent = options.getString('message');
    await handleBcRandomCommand(interaction, count, messageContent);
  }
});

// دالة لمعالجة أمر البث العام (bc)
async function handleBcCommand(source, messageContent) {
  if (source.member.id !== ALLOWED_USER) {
    return source.reply('You are not allowed to use this command.');
  }

  const confirmMessage = await source.reply({ content: `**Are you sure you want to send this message?**\n\`\`\`${messageContent}\`\`\``, fetchReply: true });
  await confirmMessage.react('✅');
  await confirmMessage.react('❌');

  const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === source.member.id;
  };

  const collector = confirmMessage.createReactionCollector({ filter, max: 1, time: 60000 });

  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === '✅') {
      confirmMessage.delete();

      const statsMessage = await source.channel.send('**Broadcast Started...**');

      let sentCount = 0;
      let failedCount = 0;
      const members = await source.guild.members.fetch();
      const broadcastMembers = members.filter((member) => !member.user.bot);
      const totalMembers = broadcastMembers.size;
      const botCount = members.size - totalMembers;

      const updateStats = async (sent, failed) => {
        sentCount = sent;
        failedCount = failed;
        const remaining = totalMembers - sentCount - failedCount;

        const statsEmbed = await createStatsEmbed(totalMembers, sentCount, failedCount, remaining, botCount);

        try {
          await statsMessage.edit({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
        } catch (error) {
          if (error.code === 10008) {
            console.warn('Stats message was deleted. Sending a new message with final stats.');
            await source.channel.send({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
          } else {
            console.error('Error updating stats message:', error);
          }
        }
      };

      const { sentCount: totalSent, failedCount: totalFailed, failedMembers } = await sendMessagesInBatches(
        broadcastMembers,
        messageContent,
        20,
        5000,
        updateStats
      );

      await sendFinalStats(statsMessage, totalMembers, totalSent, totalFailed, botCount);

      if (failedMembers.length > 0) {
        const failedMembersMention = failedMembers.map(member => `<@${member.id}>`).join(' ');
        await source.channel.send(`**الأعضاء الذين لم يتم إرسال الرسالة لهم:**\n${failedMembersMention}`);
      }

      await source.channel.send('**تم الانتهاء من Broadcast**');
    } else if (reaction.emoji.name === '❌') {
      confirmMessage.delete();
      const sentMessage = await source.channel.send('**Broadcast has been canceled.**');
      setTimeout(() => sentMessage.delete(), 3000);
    }
  });

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      confirmMessage.delete();
      source.channel.send('**No reaction after 60 seconds, operation canceled.**').then((msg) => setTimeout(() => msg.delete(), 3000));
    }
  });
}

// دالة لمعالجة أمر البث للرتبة (rolebc)
async function handleRoleBcCommand(source, role, messageContent) {
  if (source.member.id !== ALLOWED_USER) {
    return source.reply('You are not allowed to use this command.');
  }

  const confirmMessage = await source.reply({ content: `**Are you sure you want to send this message to ${role.name}?**\n\`\`\`${messageContent}\`\`\``, fetchReply: true });
  await confirmMessage.react('✅');
  await confirmMessage.react('❌');

  const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === source.member.id;
  };

  const collector = confirmMessage.createReactionCollector({ filter, max: 1, time: 60000 });

  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === '✅') {
      confirmMessage.delete();

      const statsMessage = await source.channel.send('**Broadcast Started...**');

      let sentCount = 0;
      let failedCount = 0;
      const members = await source.guild.members.fetch();
      const broadcastMembers = members.filter((member) => !member.user.bot && member.roles.cache.has(role.id));
      const totalMembers = broadcastMembers.size;
      const botCount = members.size - totalMembers;

      const updateStats = async (sent, failed) => {
        sentCount = sent;
        failedCount = failed;
        const remaining = totalMembers - sentCount - failedCount;

        const statsEmbed = await createStatsEmbed(totalMembers, sentCount, failedCount, remaining, botCount);

        try {
          await statsMessage.edit({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
        } catch (error) {
          if (error.code === 10008) {
            console.warn('Stats message was deleted. Sending a new message with final stats.');
            await source.channel.send({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
          } else {
            console.error('Error updating stats message:', error);
          }
        }
      };

      const { sentCount: totalSent, failedCount: totalFailed, failedMembers } = await sendMessagesInBatches(
        broadcastMembers,
        messageContent,
        20,
        5000,
        updateStats
      );

      await sendFinalStats(statsMessage, totalMembers, totalSent, totalFailed, botCount);

      if (failedMembers.length > 0) {
        const failedMembersMention = failedMembers.map(member => `<@${member.id}>`).join(' ');
        await source.channel.send(`**الأعضاء الذين لم يتم إرسال الرسالة لهم:**\n${failedMembersMention}`);
      }

      await source.channel.send('**تم الانتهاء من Broadcast**');
    } else if (reaction.emoji.name === '❌') {
      confirmMessage.delete();
      const sentMessage = await source.channel.send('**Broadcast has been canceled.**');
      setTimeout(() => sentMessage.delete(), 3000);
    }
  });

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      confirmMessage.delete();
      source.channel.send('**No reaction after 60 seconds, operation canceled.**').then((msg) => setTimeout(() => msg.delete(), 3000));
    }
  });
}

// دالة لمعالجة أمر البث العشوائي (bcrandom)
async function handleBcRandomCommand(source, count, messageContent) {
  if (source.member.id !== ALLOWED_USER) {
    return source.reply('You are not allowed to use this command.');
  }

  const confirmMessage = await source.reply({ content: `**Are you sure you want to send this message to ${count} random members?**\n\`\`\`${messageContent}\`\`\``, fetchReply: true });
  await confirmMessage.react('✅');
  await confirmMessage.react('❌');

  const filter = (reaction, user) => {
    return ['✅', '❌'].includes(reaction.emoji.name) && user.id === source.member.id;
  };

  const collector = confirmMessage.createReactionCollector({ filter, max: 1, time: 60000 });

  collector.on('collect', async (reaction, user) => {
    if (reaction.emoji.name === '✅') {
      confirmMessage.delete();

      const statsMessage = await source.channel.send('**Broadcast Started...**');

      let sentCount = 0;
      let failedCount = 0;
      const members = await source.guild.members.fetch();
      const broadcastMembers = members.filter((member) => !member.user.bot);
      const totalMembers = broadcastMembers.size;
      const botCount = members.size - totalMembers;

      const randomMembers = broadcastMembers.random(count);

      const updateStats = async (sent, failed) => {
        sentCount = sent;
        failedCount = failed;
        const remaining = count - sentCount - failedCount;

        const statsEmbed = await createStatsEmbed(count, sentCount, failedCount, remaining, botCount);

        try {
          await statsMessage.edit({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
        } catch (error) {
          if (error.code === 10008) {
            console.warn('Stats message was deleted. Sending a new message with final stats.');
            await source.channel.send({ embeds: [statsEmbed], content: '**Broadcast In Progress...**' });
          } else {
            console.error('Error updating stats message:', error);
          }
        }
      };

      const { sentCount: totalSent, failedCount: totalFailed, failedMembers } = await sendMessagesInBatches(
        randomMembers,
        messageContent,
        20,
        5000,
        updateStats
      );

      await sendFinalStats(statsMessage, count, totalSent, totalFailed, botCount);

      if (failedMembers.length > 0) {
        const failedMembersMention = failedMembers.map(member => `<@${member.id}>`).join(' ');
        await source.channel.send(`**الأعضاء الذين لم يتم إرسال الرسالة لهم:**\n${failedMembersMention}`);
      }

      await source.channel.send('**تم الانتهاء من Broadcast**');
    } else if (reaction.emoji.name === '❌') {
      confirmMessage.delete();
      const sentMessage = await source.channel.send('**Broadcast has been canceled.**');
      setTimeout(() => sentMessage.delete(), 3000);
    }
  });

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      confirmMessage.delete();
      source.channel.send('**No reaction after 60 seconds, operation canceled.**').then((msg) => setTimeout(() => msg.delete(), 3000));
    }
  });
}

// دالة لإرسال الرسائل بشكل متوازي
async function sendMessagesInBatches(members, messageContent, batchSize, delayBetweenBatches, updateStats) {
  let sentCount = 0;
  let failedCount = 0;
  const failedMembers = [];

  const memberChunks = Array.from({ length: Math.ceil(members.size / batchSize) }, (_, i) =>
    Array.from(members.values()).slice(i * batchSize, (i + 1) * batchSize)
  );

  for (const chunk of memberChunks) {
    const sendPromises = chunk.map(async (member) => {
      if (!member.user.bot) {
        try {
          const dmMessage = `${messageContent}\n<@${member.id}>`;
          await member.send(dmMessage);
          sentCount++;
        } catch (err) {
          if (err.code === 50007) {
            console.log(`Cannot send message to ${member.user.tag} (User has DMs disabled or bot is blocked).`);
          } else {
            console.error(`Could not send message to ${member.user.tag}:`, err);
          }
          failedCount++;
          failedMembers.push(member);
        }
      }
    });

    await Promise.all(sendPromises);
    updateStats(sentCount, failedCount);
    await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
  }

  return { sentCount, failedCount, failedMembers };
}

// دالة لإنشاء Embed بالإحصائيات
async function createStatsEmbed(totalMembers, sentCount, failedCount, remaining, botCount) {
  const embed = new EmbedBuilder()
    .setTitle('📊 إحصائيات البث')
    .setColor('#a4c8fd')
    .setDescription(
      `👥 إجمالي الأعضاء: ${totalMembers}\n\n` +
      `📨 الرسائل المرسلة: ${sentCount}\n\n` +
      `❌ الرسائل الفاشلة: ${failedCount}\n\n` +
      `⏳ المتبقي: ${remaining}\n\n` +
      `🤖 البوتات: ${botCount}`
    )
    .setTimestamp();

  return embed;
}

// دالة لإرسال الإحصائيات النهائية
async function sendFinalStats(statsMessage, totalMembers, sentCount, failedCount, botCount) {
  const remaining = totalMembers - sentCount - failedCount;
  const finalEmbed = await createStatsEmbed(totalMembers, sentCount, failedCount, remaining, botCount);

  try {
    await statsMessage.edit({ embeds: [finalEmbed], content: '**Broadcast Finished**' });
  } catch (error) {
    if (error.code === 10008) {
      console.warn('Stats message was deleted. Sending a new message with final stats.');
      await statsMessage.channel.send({ embeds: [finalEmbed], content: '**Broadcast Finished**' });
    } else {
      console.error('Error editing final stats message:', error);
    }
  }
}

// تسجيل الدخول
client.login(process.env.TOKEN);