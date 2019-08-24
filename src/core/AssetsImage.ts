export class AssetsImage {

    url = "https://assets.trustwalletapp.com"

    getCoinImage(name: string): string {
        return `${this.url}/blockchains/${name}/info/logo.png`
    }
}