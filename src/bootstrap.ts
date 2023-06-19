import { configDotenv } from "dotenv";
import readline from 'readline/promises';
import algoliasearch, { SearchClient } from "algoliasearch";
import logger from "./utilities/logger";
import Configuration from "./types/configuration.type";
import { omit } from "lodash";
import setEnv from "./utilities/dotenv-changer";
import figlet from "figlet";
import util from "util";
import AlgoliaService from "./services/algolia.service";
import printFiglet from "./utilities/figlet";

// import chalk from "chalk";

configDotenv();

export default class Bootstrap {

    public static async run() {

        // Printing big beautiful text
        printFiglet();

        // Start cli interface
        const rl: readline.Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'AlgoliaCLI> ',
        });

        await rl.question("Please wait debugger to attach ");


        // Configure credentials
        const config = await AlgoliaService.makeConfiguration(rl);

        // Check if credentials are valid
        const client: SearchClient = algoliasearch(config.appId, config.apiKey);

        //TODO Fix error where the method returns true with invalid api key
        if (!await AlgoliaService.connectionIsOkay(client, config)) {
            setEnv('APP_ID', '');
            setEnv('API_KEY', '');
            return;
        }

        console.info('Thanks! Now you can start using Algolia CLI!');

        // Getting the Algolia index(If it does not exist, ask again)
        const index = await AlgoliaService.getIndex(rl, client);


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
                        console.log(util.inspect(result, { colors: true, depth: null }));
                    })
                    : logger.info('No results found!');
            }
            setEnv('APP_ID', config.appId);
            setEnv('API_KEY', config.apiKey);
        } catch (error: any) {
            setEnv('APP_ID', '');
            setEnv('API_KEY', '');
            logger.error(error);
            logger.error(error.message);
        }


        rl.close();


    }

}