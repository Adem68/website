---
author: Adem Furkan Özcan
pubDatetime: 2020-03-14T20:00:00.000+03:00
modDatetime: 
title: Coronavirus Takip Uygulaması
featured: false
draft: false
tags:
  - coronavirus
  - virus
  - mobile
  - malware
  - zararlı yazılım
  - android
  - uygulama
  - covidlock
description: Coronavirus takip uygulaması zararlı yazılım analizi
---

Merhaba,

Uzun bir aradan sonra yeni bir blog yazısıyla karşınızdayım.

## Giriş

Corona (nCoV-19, 2019-nCoV, korona) virüsü tüm dünyanın gündeminde olduğu için, zararlı yazılım geliştiren kötü niyetli hackerlar hedef olarak coronayı seçmişler. Coronavirus izleme uygulaması için coronavirusapp[.]site diye bir website açıp, apk dosyasını site üzerinden yayınlamışlar. Girişi okuduğuna göre artık bir sonraki adıma geçebiliriz.

## Ön İnceleme

Uygulamanın apksını kendi sitesinden download apk'ya basıp indirebilirsin. Hazırsan, jadx-gui'yi açıp apk dosyamızı seçelim. Sonrasında MainActivity'nin nerede olduğunu öğrenmek için AndroidManifest.xml'e girip kodlara bir bakalım.

```java
        <activity android:name="com.device.security.activities.MainActivity" android:excludeFromRecents="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
```
MainActivity'nin nerede olduğunu öğrendik, şimdi websitedeki ekran görüntülerine bakalım.


<img src="/assets/images/covidlock/corona-landing.png" alt="coronavirus app landing" border="0">
&nbsp;

Güya bizi böyle bir arayüz karşılıyor ama gerçek arayüze bakalım 😏
&nbsp;

<img src="/assets/images/covidlock/corona-main.png" alt="coronavirus app main" border="0" copyright="DomainTools">
&nbsp;

Uygulama bizden erişilebilirlik ve kilit ekranını etkinleştirme ayarlarına izin vermemizi istiyor. Peki bu izinleri verdiğimizde ne oluyor? O zaman Reverse Time 🔧🔨⚡

## Reverse Time 💻

MainActivity'nin nerede olduğunu görmüştük diğer aktivitelere de bakalım.

<img src="/assets/images/covidlock/corona-activities.png" alt="coronavirus app landing" border="0">
&nbsp;

- BlockedAppActivity
- MainActivity
- StartServiceActivity

Bizleri karşılıyor. MainActivity'e geri dönüp kodları biraz inceleyelim. Bizi ilgilendiren kısım 155.ci satırdaki deviceAdministratorRequest fonksiyonu.

```java
  private void deviceAdministratorRequest() {
      ComponentName componentName = new ComponentName(this, ActivateDeviceAdminReceiver.class);
      Intent intent = new Intent("android.app.action.ADD_DEVICE_ADMIN");
      intent.putExtra("android.app.action.SET_NEW_PASSWORD", componentName);
      intent.putExtra("android.app.extra.DEVICE_ADMIN", componentName);
      startActivityForResult(intent, 1000);
  }
```

Uygulama Device Admin izniyle kilit şifresi koyuyor ve kendini device admin olarak ekliyor.

Peki uygulamanın istediği izinleri verdiğimizde cihazda ne oluyor?
&nbsp;

<img src="/assets/images/covidlock/corona-ransomware.png" alt="coronavirus app ransomware" border="0" copyright="DomainTools">
&nbsp;


Kısaca telefonunuz şifrelendi ve 48 saat içinde 100 dolar bitcoin ödemezseniz her şey silinecek diyor. Hadi bu ekranın kaynak koduna bakalım.

BlockedAppActivity'e giriyoruz ve onCreate fonksiyonuna bakıyoruz.

```java
public /* synthetic */ void lambda$onCreate$2$BlockedAppActivity(View view) {
       Intent intent = new Intent("android.intent.action.VIEW", Uri.parse("hxxps://qmjy6.bemobtracks.com/go/ff06aca3-21c7-4619-b27a-6bae0db6722b"));
       intent.addFlags(268435456);
       List<String> allBrowsersList = Util.getAllBrowsersList(this);
       if (allBrowsersList.size() > 0) {
           try {
               intent.setPackage(allBrowsersList.get(0));
               startActivity(intent);
           } catch (ActivityNotFoundException e) {
               e.printStackTrace();
           }
       } else {
           Toast.makeText(this, "No Browser App Found", 1).show();
       }
   }

```

Uygulama cihazda varsayılan tarayıcıyla `hxxps://qmjy6.bemobtracks.com/go/ff06aca3-21c7-4619-b27a-6bae0db6722b` linkini açıyor ve https://pastebin.com/GK8qrfaC linkine gidiyor. Pastebin'de nasıl ödeme yapacağınız anlatılmış.

## Biraz Eğlenelim

Şimdi işin komik tarafına gelelim 🙂

BlockedAppActivity'de 76. satırdaki verifyPin fonksiyonuna bakıyoruz ve boom 💥

```java
private void verifyPin() {
        String trim = this.secretPin.getText().toString().trim();
        if (TextUtils.isEmpty(trim)) {
            Toast.makeText(this, "enter decryption code", 0).show();
        }
        if (trim.equals("4865083501")) {
            SharedPreferencesUtil.setAuthorizedUser(this, "1");
            Toast.makeText(this, "Congrats. You Phone is Decrypted", 0).show();
            finish();
            return;
        }
        Toast.makeText(this, "Failed, Decryption Code is Incorrect", 0).show();
    }
```

Uygulamayı yapan eleman decrypt şifresini kodunun içine açık bir şekilde koymuş 🤣


## Son

Yazıyı buraya kadar okuduğun için teşekkür ederim 😃

## Kaynaklar


[https://www.domaintools.com/resources/blog/covidlock-mobile-coronavirus-tracking-app-coughs-up-ransomware (Cihaz resimleri bu siteden alındı ve bu yazıyı yazmama vesile oldu)](https://www.domaintools.com/resources/blog/covidlock-mobile-coronavirus-tracking-app-coughs-up-ransomware)

[https://github.com/skylot/jadx (yazıda bahsi geçen jadx-gui aracı)](https://github.com/skylot/jadx)