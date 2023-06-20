import algoliasearch, { SearchClient, SearchIndex } from "algoliasearch";
import logger from "../utilities/logger";
import Configuration from "../types/configuration.type";
import readline from 'readline/promises';
import { resetEnvironmentVariables, setEnv } from "../utilities/dotenv-changer";


export default class AlgoliaService {

    static index: string = '';

    private constructor() { }

    static async connectionIsOkay(client: SearchClient, config: Configuration): Promise<boolean> {
        const index = client.initIndex('null');
        try {
            await index.search('');
            return true;
        } catch (error: any) {
            if (error.message.startsWith('Unreachable host') ||
                error.message.startsWith('Invalid A')) {
                logger.error('Connection failed! Please check your credentials!');
                return false;
            }
            logger.info('Connection successful!');
            return true;
        }
    }

    static async connectToAlgolia(rl: readline.Interface): Promise<SearchClient> {
        const config = await this.makeConfiguration(rl);
        const client: SearchClient = algoliasearch(config.appId, config.apiKey);
        if (!await this.connectionIsOkay(client, config)) {
            resetEnvironmentVariables();
            return await this.connectToAlgolia(rl);
        }
        return client;

    }


    private static async makeConfiguration(rl: readline.Interface): Promise<Configuration> {
        let appId = process.env.APP_ID;
        let apiKey = process.env.API_KEY;
        if (!appId || !apiKey) {
            appId = await rl.question("Welcome to Algolia CLI!\n\nPlease enter your Algolia App ID: ");
            apiKey = await rl.question("Please enter your Algolia API Key: ");
            setEnv('APP_ID', appId);
            setEnv('API_KEY', apiKey);
        }
        return { appId, apiKey };
    }

    static async getIndex(rl: readline.Interface, client: SearchClient): Promise<SearchIndex> {
        const iX = await rl.question("Please enter your Algolia Index: ");
        const index = client.initIndex(iX);

        if (!await index.exists()) {
            console.log('Index does not exist!');
            return await AlgoliaService.getIndex(rl, client);
        }

        return index;
    }

}