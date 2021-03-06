import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { Geolocation } from 'ionic-native';
import { CreateBeaconPage } from '../create-beacon/create-beacon'
import { AuthHttp } from 'angular2-jwt';
import { AuthService } from '../../services/auth/auth.service';
import { BeaconService } from '../create-beacon/create-beacon.service';
import { BeaconInfoService } from '../../modals/beacon-info/beacon-info.service';
import { PreferenceService } from '../../pages/profile/profile.service';
import { SignUpService } from '../../pages/signup/signup.service';
import { BeaconInfo } from '../../modals/beacon-info/beacon-info';
import * as io from 'socket.io-client';
import 'rxjs/add/operator/map';

declare var google;

let beaconData;

@Component({
  selector: 'home-page',
  templateUrl: 'home.html',
  providers: [AuthService, BeaconService, BeaconInfoService, PreferenceService, SignUpService]
})

export class HomePage {
  public chatInput;
  public loaded = false;
  createBeacon: any = CreateBeaconPage;
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  myData: any;
  token: any;
  theCenter: any;
  public socket = io.connect('https://ec2-54-67-94-166.us-west-1.compute.amazonaws.com:443');



  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public httpService: BeaconService,
    public auth: AuthService,
    public TEST: SignUpService,
    public info: BeaconInfoService,
    public pref: PreferenceService
  ) {}

  ionViewDidLoad(){
    this.loadMap();
    this.userInit();
  }

  // initialize user authentication
  userInit() {
    console.log("localStorage", localStorage);
    if(localStorage.getItem('userId') === "null") {
      this.auth.login();
    }
  }
  openModal(content) {
    console.log('got in to openModal', content);
    this.info.getMessages(content.chatroom)
      .subscribe(data => {
        let chat = data;
        console.log('this is chat in modal:', chat);
        let socket = io.connect('https://ec2-54-67-94-166.us-west-1.compute.amazonaws.com:443')
        let modal = this.modalCtrl.create(BeaconInfo, {
          beacon: content,
          socket: socket,
          chat: chat
        })
        // this.navCtrl.push(BeaconInfo, {
        //    beacon: content,
        //   socket: socket,
        //   chat: chat
        // })

        // console.log('modal data:', modal.data);
        modal.present();
      })
  }

  loadMap(){
    Geolocation.getCurrentPosition()
      .then((position) => {
        // console.log('geo position:', position);

        let center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // console.log("center:", center)

        // convert center to JS object
        let currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        console.log('current location:', currentLocation);
        localStorage.setItem('currentLocation', JSON.stringify(currentLocation));

        this.theCenter = center
        let mapOptions = {
          center: center,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles:
          [{"featureType":"all","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"weight":"1.2"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"weight":"1"},{"visibility":"off"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit.station","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#b4d2dc"}]}]
        }
        this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
        this.getCurrentAddress();
        this.loadBeacon();

      }, (err) => {
        console.log(err);
      });

  }

  centerMap(){
      this.map.panTo(this.theCenter);
  }

  loadBeacon() {
    let that = this



            // icon: icons[beaconData].icon
    // get user preferences
    this.pref.getPreferences()
      .subscribe(preferences => {
        let prefs = preferences;

        this.httpService.getBeaconsAll()
          .subscribe(data => {
            this.myData = data;
            console.log('ThisMyData before forEach: ', this.myData)
            this.myData.forEach(beaconData => {
              if(prefs[beaconData.CategoryId - 1] === 1 || beaconData.CategoryId === 10) {
                let beacon = new google.maps.Marker({
                  map: that.map,
                  animation: google.maps.Animation.DROP,
                  position: JSON.parse(beaconData.position),
                  icon: beaconData.icon
                })
                let beaconTime = beaconData.createdAt.toLocaleString();
                console.log("pooofdsajifdsa", beaconTime)
                let content = {
                  id: beaconData.id,
                  title: beaconData.title,
                  details: beaconData.details,
                  tags: beaconData.tags,
                  private: beaconData.private,
                  chatroom: beaconData.ChatroomId,
                  createdAt: beaconTime,
                  firstName: beaconData.User.firstName,
                  lastName: beaconData.User.lastName,
                  address: beaconData.address
                }
                that.addInfoWindow(beacon, content);
              }
            })
          })
      })
  }

  getCurrentAddress() {
    let geocoder = new google.maps.Geocoder;
    this.geocodeLatLng(geocoder)
  }


  geocodeLatLng(geocoder) {
    // let coordinates = localStorage.getItem('currentLocation');
    // let latlngStr = coordinates.split(',', 2);
    // let latlng = {lat: parseFloat(latlngStr[0].slice(1)), lng: parseFloat(latlngStr[1])};
    // console.log(latlng)
    let location = JSON.parse(localStorage.getItem('currentLocation'));

    geocoder.geocode({'location': location}, (results, status) => {
      if (status === 'OK') {
        if (results[1]) {
          localStorage.setItem('currentAddress', results[0].formatted_address)
        } else {
          window.alert('Current Address Not Found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }





  addBeacon(){
    this.navCtrl.push(CreateBeaconPage, {
      position: this.map.getCenter()
    });
  }



  addInfoWindow(beacon, content){
    let that = this;
    let mousedUp = true;

    let infoWindow = new google.maps.InfoWindow({
      content: `

        <div id="infoWindow">
          <div class="=infoWindowTitle">
            ${content.title}
          </div>
          <br>
          <div id="infoWindowBody">
            ${content.details}
          </div>
        </div>`
    });

    google.maps.event.addListener(beacon, 'click', () => {
      console.log('this is beacon: ', beacon);
      console.log('this is content: ', content)
      infoWindow.open(content, beacon);
    })

    google.maps.event.addListener(beacon, 'mousedown', () => {
      mousedUp = false;
      setTimeout(() => {
        if(mousedUp === false) {
          that.openModal(content);
        }
      }, 1000)
    })

    google.maps.event.addListener(beacon, 'mouseup', () => {
      mousedUp = true
    })

    google.maps.event.addListener(beacon, 'dragstart', () => {
      mousedUp = true;
    })


  }

  // optional chat message rendering function
  populateMessages() {

  }
}
