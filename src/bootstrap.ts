import { configDotenv } from "dotenv";
import readline from 'readline/promises';
import algoliasearch from "algoliasearch";
import logger from "./utilities/logger";
import Configuration from "./types/configuration.type";
import { omit } from "lodash";
import setEnv from "./utilities/dotenv-changer";
import figlet from "figlet";

// import chalk from "chalk";

configDotenv();

export default class Bootstrap {

    public static async run() {

        console.log(`${figlet.textSync('Algolia CLI', {
            horizontalLayout: 'full',
        })}`);

        // console.log("%cThis is a green text", "color:green");

        // Start cli interface
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'AlgoliaCLI> ',
        });

        let appId = process.env.APP_ID;
        let apiKey = process.env.API_KEY;

        if (!appId || !apiKey) {

            appId = await rl.question("Welcome to Algolia CLI!\n\nPlease enter your Algolia App ID: ");
            apiKey = await rl.question("Please enter your Algolia API Key: ");
        }

        const config: Configuration = { appId, apiKey };

        const iX = await rl.question("Please enter your Algolia Index: ");
        console.log('Thanks! Now you can start using Algolia CLI!');

        const client = algoliasearch(config.appId, config.apiKey);
        const index = client.initIndex(iX);
        try {
            while (true) {
                const query = await rl.question("Please enter your query: ");
                if (query === 'exit') {
                    break;
                }

                const content = await index.search(query);
                const hits = content.hits;
                const resultArr = hits.map((hit) => {
                    return omit(hit, ['objectID', '_highlightResult']);
                });

                resultArr.length > 0
                    ? resultArr.forEach((result) => {
                        console.log(JSON.stringify(result, null, 2));
                    })
                    : logger.info('No results found!');
            }
            setEnv('APP_ID', config.appId);
            setEnv('API_KEY', config.apiKey);
        } catch (error: any) {
            setEnv('APP_ID', '');
            setEnv('API_KEY', '');
            logger.error(error.message);
        }


        rl.close();


    }

}