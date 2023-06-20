import { config, configDotenv } from "dotenv";
import readline from 'readline/promises';
import algoliasearch, { SearchClient } from "algoliasearch";
import logger from "./utilities/logger";
import Configuration from "./types/configuration.type";
import { omit } from "lodash";
import figlet from "figlet";
import util from "util";
import AlgoliaService from "./services/algolia.service";
import printFiglet from "./utilities/figlet";
import { setEnv } from "./utilities/dotenv-changer";

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

        // await rl.question("Please wait debugger to attach ");

        // Creating Algolia client and checking if connection is okay
        const client = await AlgoliaService.connectToAlgolia(rl);

        console.log('You can now start using Algolia CLI!');

        // Getting the Algolia index(If it does not exist, ask again)
        const index = await AlgoliaService.getIndex(rl, client);

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



        rl.close();


    }

}