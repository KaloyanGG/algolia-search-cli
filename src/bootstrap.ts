import { configDotenv } from "dotenv";
import readline from 'readline/promises';
import algoliasearch from "algoliasearch";
import logger from "./utilities/logger";
import Configuration from "./types/configuration.type";
import { omit } from "lodash";
import setEnv from "./utilities/dotenv-changer";
// import { Omit } from "utility-types";

configDotenv();

export default class Bootstrap {

    public static async run() {
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
            // const configuration: Configuration = {appId, apiKey};

        }
        const iX = await rl.question("Please enter your Algolia Index: ");

        console.log('Thanks! Now you can start using Algolia CLI!');

        const client = algoliasearch(appId, apiKey);
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

                console.table(resultArr);
            }
            setEnv('APP_ID', appId);
            setEnv('API_KEY', apiKey);
        } catch (error: any) {
            setEnv('APP_ID', '');
            setEnv('API_KEY', '');
            logger.error(error.message);
        }


        rl.close();


    }

}