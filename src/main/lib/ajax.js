/**
 * Mouse Dictionary (https://github.com/wtetsu/mouse-dictionary/)
 * Copyright 2018-present wtetsu
 * Licensed under MIT
 */

const post = (url, data) => {
  // ロードの表示
  const loading = document.getElementById('eitango_api_load');
  const loading_message = document.getElementById('eitango_load_message');

  // XMLリクエスト
  const request = new XMLHttpRequest();
  const json = JSON.stringify(data);

  request.open('POST', url, true);
  request.setRequestHeader("Content-Type", "application/json");

  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      // 結果処理
      console.log(request);
      const result = JSON.parse(request.response);

      if (result.result) { // ok なら
        loading_message.innerHTML = "ok!";

        setTimeout(() => { // loadingを非表示
          loading.style.display = "none";
        }, 1200);

      } else { // エラーなら
        const error_message_box = document.getElementById('eitango_error_message_box');
        const message = document.getElementById('eitango_error_message');

        let str = "エラーが発生しました。もう一度お試しください。";
        switch (result.error_code) {
          case 398:
          str = "保存できる単語数の上限に達しました。有料プラン(ひと月400円~)にアップグレードして、無制限で単語の保存をしましょう。";
          break;

          case 399:
          str = "メールアドレスとパスワードの組み合わせが間違っています。";
          break;

          case 400:
          str = "この単語はすでに登録されています。";
          break;

          case 401:
          str = "入力が許可されていない形式です。";
          break;
        }
        message.innerHTML = str;

         // loadは非表示、errorは表示
        loading.style.display = "none";
        error_message_box.style.display = "flex";
        setTimeout(() => {
          error_message_box.style.display = "none";
        }, 2000);
      }

    }
  }
  request.send(json);

};

export default { post };
