import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

const cryptocompare_url_multi = "https://min-api.cryptocompare.com/data/pricemulti";
const cryptocompare_url_single = "https://min-api.cryptocompare.com/data/price";
const storageName = "cryptoHoldings";

interface Holding {
  crypto: string,
  amount: number,
  value?: number,
  total: number
}

@Injectable()
export class CryptoCompareProvider {

  public holdings: Holding[] = [];
  public loaderPriceTimeout: any;

  constructor(public http: HttpClient, private storage: Storage) {}

  loadHoldings(): void {
    this.storage.get(storageName).then(holdings => {
      if(holdings !== null) {
        holdings.sort(this.compareByCrpto);
        this.holdings = holdings;
        if(this.holdings.length) {
          this.fetchPrices();
        }
      }
    });
  }

  fetchPrices(): void {
    let fysms = this.getFysms();
    let request = this.http.get(cryptocompare_url_multi + '?fsyms='+fysms+'&tsyms=IDR');
    request.subscribe(
      results => {
        let holdingResults: Holding[] = [];

        for(let x in results) {
          if(results.hasOwnProperty(x)) {
            let currentHolding: Holding = this.holdings.find(item => item.crypto === x.toString());
            if(currentHolding) {
              let holdingItem = {
                crypto: x,
                amount: currentHolding.amount,
                value: results[x].IDR,
                total: currentHolding.amount * results[x].IDR
              }
              holdingResults.push(holdingItem);
            }
          }
        }

        holdingResults.sort(this.compareByCrpto);
        this.holdings = holdingResults;
      },
      err => {
        console.log('error');
      }
    );
  }

  getFysms(): string {
    let fysms = '';
    if(this.holdings.length) {
      this.holdings.forEach((holding) => {
        fysms = fysms + holding.crypto + ',';
      });
      fysms = fysms.slice(0, -1);
    }
    return fysms;
  }

  verifyHolding(holding: Holding): Observable<any> {
    return this.http.get(cryptocompare_url_single + '?fsym='+holding.crypto+'&tsyms=IDR');
  }

  addHolding(holding: Holding): void {
    let currentHolding: Holding = this.holdings.find(item => item.crypto === holding.crypto);
    if (currentHolding) {
      this.holdings.splice(this.holdings.indexOf(currentHolding), 1);
    }
    
    this.holdings.push(holding);
    this.saveHoldings();
    this.fetchPrices();
  }

  removeHolding(holding): void {
    this.holdings.splice(this.holdings.indexOf(holding), 1);
    this.saveHoldings();
    this.fetchPrices();
  }

  saveHoldings(): void {
    this.storage.set(storageName, this.holdings);
  }

  clearTimeout(): void {
    clearInterval(this.loaderPriceTimeout);
  }

  compareByCrpto(a, b): number {
    if (a.crypto < b.crypto) return -1;
    if (a.crypto > b.crypto) return 1;
    return 0;
  }

}
