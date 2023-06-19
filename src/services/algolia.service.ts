import { SearchClient, SearchIndex } from "algoliasearch";
import logger from "../utilities/logger";
import Configuration from "../types/configuration.type";
import readline from 'readline/promises';


export default class AlgoliaService {

    static index: string = '';

    private constructor() { }

    static async connectionIsOkay(client: SearchClient, config: Configuration): Promise<boolean> {
        const index = client.initIndex('null');
        try {
            await index.search('');
            return true;
        } catch (error: any) {
            if (error.name === 'RetryError') {
                logger.error('Connection failed! Please check your credentials!');
                return false;
            }
            logger.info('Connection successful!');
            return true;
        }
    }

    static async makeConfiguration(rl: readline.Interface): Promise<Configuration> {
        let appId = process.env.APP_ID;
        let apiKey = process.env.API_KEY;
        if (!appId || !apiKey) {
            appId = await rl.question("Welcome to Algolia CLI!\n\nPlease enter your Algolia App ID: ");
            apiKey = await rl.question("Please enter your Algolia API Key: ");
        }
        return { appId, apiKey };
    }

    static async getIndex(rl: readline.Interface, client: SearchClient): Promise<SearchIndex> {
        const iX =await rl.question("Please enter your Algolia Index: ");
        const index = client.initIndex(iX);
        // try {
        //     const exists = await index.exists();
        //     console.log(exists);

        // } catch (error) {
        //     console.log(error);
        //     // logger.error('Index does not exist!');
        // }
        if (!await index.exists()) {
            console.log('Index does not exist!');
            return await AlgoliaService.getIndex(rl, client);
        }
        return index;
    }

}