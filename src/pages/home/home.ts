import { Component } from '@angular/core';
import { NavController, IonicPage, AlertController } from 'ionic-angular';
import { CryptoCompareProvider } from '../../providers/crypto-compare/crypto-compare';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private isActive: boolean = true;
  private sub: Subscription;

  constructor(
    public navCtrl: NavController,
    private cryptoCompareProvider: CryptoCompareProvider,
    private alertCtrl: AlertController) {

  }

  ionViewDidLoad() {
    this.isActive = true;
    this.cryptoCompareProvider.loadHoldings();
    this.sub = Observable.interval(8000).subscribe(() => {
      this.cryptoCompareProvider.loadHoldings();
    });
  }

  ionViewWillLeave() {
    this.sub.unsubscribe();
  }

  addHolding(): void {
    this.navCtrl.push('AddHoldingPage');
  }

  showRemoveConfirm(holding): void {
    let confirm = this.alertCtrl.create({
      title: 'Remove holding',
      message: 'Are you sure to delete '+ holding.crypto +' ?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.cryptoCompareProvider.removeHolding(holding);
          }
        }
      ]
    });
    confirm.present();
  }

}
