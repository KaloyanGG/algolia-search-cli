import figlet from "figlet";

export default function printFiglet(text: string = 'Algolia CLI') {
    console.log(`${figlet.textSync(text, {
        horizontalLayout: 'full',
    })}`);
}