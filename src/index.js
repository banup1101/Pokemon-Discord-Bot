/*How to use the discord bot:
    to run the bot type nodemon in the terminal
    nodemon allows the bot to constantly update every time we change something
    without having to take it off and type all that funny stuff again

    to take off bot do ctrl + c in the terminal
*/

require('dotenv').config();

const { Client, Events, IntentsBitField, EmbedBuilder, SlashCommandBuilder, PermissionsBitField, Permissions } = require("discord.js");

//client is the bot instance
const client = new Client({
    //intents are just discord permissions for the bot
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,

    ]
})


//lets us know the bot is online
client.on(Events.ClientReady, (c) => {
    console.log(`${c.user.tag} is online`); //lets us know the bot is online in the terminal. c.user.tag is the bots discord username + tag
    client.user.setActivity("Beep Bop") //sets bot activity

    /*
    This is also where slash commands will go for now. They need a name and a description. Need to make a seperate file for slash commands in the future
    */

    const hello = new SlashCommandBuilder()
        .setName("hello")
        .setDescription("This is a slash command that has the bot tell you hello")


    const info = new SlashCommandBuilder()
        .setName("info")
        .setDescription("This is a slash command that tells you basic bot info")

    const add = new SlashCommandBuilder()
        .setName("add")
        .setDescription("This is a command that will let you add two numbers")
        .addNumberOption(option =>
            option
                .setName("number1")
                .setDescription("Enter the first number")
                .setRequired(true)
        )
        .addNumberOption(option =>
            option
                .setName("number2")
                .setDescription("Enter the second number")
                .setRequired(true)
        )

    /*
    The search command allows the user to search for a pokemon. It will output the pokemons information. This data is from PokeAPI. 
    */
    const search = new SlashCommandBuilder()
        .setName("search")
        .setDescription("This command lets the user search for a Pokemon and display its information")
        .addStringOption(option =>
            option
                .setName("pokemon-name")
                .setDescription("Enter the name of the Pokemon you want to search for")
                .setRequired(true)
        )

    /*
    The moveset command allows the user to search for a pokemons moves. 
    */
    const moveset = new SlashCommandBuilder()
        .setName("moveset")
        .setDescription("This is a command that will let you search up the moveset of a pokemon")
        .addStringOption(option =>
            option
                .setName("pokemon-name")
                .setDescription("Enter the name of the Pokemon whose moveset you want to know")
                .setRequired(true)
        )

    /*
    The shiny command allows the user to search for a pokemons and it will output the pokemons shiny sprite. 
    */
    const shiny = new SlashCommandBuilder()
        .setName("shiny")
        .setDescription("This is a command that will let you search for a shiny pokemon you want")
        .addStringOption(option =>
            option
                .setName("pokemon-name")
                .setDescription("Enter the name of the shiny pokemon you want to display")
                .setRequired(true)
        )

    /*
    This is where the commands will be created for discord
    */
    client.application.commands.create(hello); //you can also do something like (hello, serverID) but thats dumb
    client.application.commands.create(info);
    client.application.commands.create(add);

    client.application.commands.create(search);
    client.application.commands.create(moveset);
    client.application.commands.create(shiny);

})


/*
This is where the magic happens and the command gets functionality
*/
client.on('interactionCreate', (interaction) => {
    //this returns nothing if a command isnt inputted
    if (!interaction.isChatInputCommand()) {
        return;
    }

    //slash commands go here:

    if (interaction.commandName == "hello") {
        interaction.reply("Hello!");
    }

    if (interaction.commandName == "info") {
        interaction.reply("Hello! I am Rotom-Bot. My purpose is to display Pokemon information and am able to play music in voice chats.")
    }

    if (interaction.commandName == "add") {
        const num1 = interaction.options.getNumber("number1");
        const num2 = interaction.options.getNumber("number2");
        const sum = num1 + num2;

        interaction.reply("The Sum is: " + sum);
    }

    //i shouldve just made functions to get the information lol
    //pokemon can have either one or two types. They can also have 2-3 abilities. gotta fix that



    if (interaction.commandName == "search") {
        const pokemonname = interaction.options.getString("pokemon-name").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonname}`) //${thinghere} comes in clutch here and lets us use the variable and what its value is
            .then((response) => response.json())
            .then((data) => {

                /*getting description is being weird because its so hard to go through everything
                const id = data.id;
                fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`) //${thinghere} comes in clutch here and lets us use the variable and what its value is
                    .then((response) => response.json())
                    .then((data2) => {
                    const description = data2.version.flavor_text;
                    console.log(description);
                    })
                    */


                /*
                Pokemon can have either one or two types. Get it and store it in an array
                */
                const typesArray = data.types.map(typeInfo => {
                    return typeInfo.type.name.toUpperCase();
                });

                /*
                Pokemon can have multiple abilities AND a hidden ability. Get it and store it in an array
                */

                const abilitiesArray = data.abilities.map(abilityInfo => {
                    return abilityInfo.ability.name.toUpperCase();
                })

                /*
                This is where we create the message the bot will output
                */

                interaction.reply("Pokemon: " + data.name.toUpperCase() + "\n" +
                    "Dex ID: #" + data.id + "\n" +
                    "Type: " + typesArray + "\n" +
                    "Abilities: " + abilitiesArray + "\n" +
                    data.sprites.front_default);

            }).catch((err) => {
                interaction.reply("Pokemon Not Found");
            });

    }

    /*
    This moveset displays the moveset of a pokemon the user searches for. Only problem is that it chat floods LOL
    */

    if (interaction.commandName == "moveset") {
        const pokemonname = interaction.options.getString("pokemon-name").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonname}`) //${thinghere} comes in clutch here and lets us use the variable and what its value is
            .then((response) => response.json())
            .then((data) => {

                const movesetArray = data.moves.map(moveInfo => {
                    return moveInfo.move.name.toUpperCase() + "\t";
                });

                interaction.reply(`The moveset for ${pokemonname} is: ` + movesetArray);


            }).catch((err) => {
                interaction.reply("Pokemon Not Found");
            });
    }

    /*
    This command outputs a shiny pokemon the user searches for
    */

    if (interaction.commandName == "shiny") {
        const pokemonname = interaction.options.getString("pokemon-name").toLowerCase();
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonname}`) //${thinghere} comes in clutch here and lets us use the variable and what its value is
            .then((response) => response.json())
            .then((data) => {

                interaction.reply(`Here is the shiny for ${pokemonname}: ` + data.sprites.front_shiny + " " + data.sprites.back_shiny);


            }).catch((err) => {
                interaction.reply("Pokemon Not Found");
            });

            /*
            Need to include something for if null
            */
    }

/*
    if(interaction.commandName == "random"){
        const random = Math.randint(1, 1280);
    } */

    /*
    This is where the command that will give you a random pokemon will go
    */


})


/*prevents the bot from constantly replying to itself. 
very scary if this happens :monkaS */
client.on('messageCreate', (message) => {
    if (message.author.bot) {
        return;
    }
})

/*this just repeats what message a user sent in the terminal
client.on('messageCreate', (message) => {
    console.log(message.content);
}) */




/*
Deleting a Command (oh look theres nothing there)
*/


client.login(process.env.TOKEN);