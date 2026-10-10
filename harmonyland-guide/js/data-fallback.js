/* 自動生成ファイル（build.py）。直接編集しないこと。編集は data/*.json に行い、python3 build.py で再生成する。 */
window.HL_BUNDLED_DATA = {
 "app-config": {
  "appName": "ハーモニーランド攻略ナビ",
  "facilityName": "サンリオキャラクターパーク ハーモニーランド",
  "facilityAddress": "大分県速見郡日出町",
  "targetDate": "2026-10-13",
  "targetDateLabel": "2026年10月13日（火）",
  "targetDayType": "weekday",
  "targetDayTypeNote": "10月12日（月）はスポーツの日。対象日の10月13日（火）は平日として扱う。",
  "informationPeriod": {
   "startDate": "2025-10-13",
   "endDate": "2026-10-13"
  },
  "dataVersion": "2026-10-10b",
  "dataPreparedAt": "2026-10-10",
  "dataNote": "公式ページの内容は、2026年10月10日に利用者から提供された統合資料（公式サイト・公式FAQ・イベントページの記載をまとめたもの）と、検索結果の要約で確認している。アプリ作成者は開発環境から公式サイトへ直接接続できず、本文は直接確認していない。施設の位置は利用者提供の園内マップ画像から読み取り、独自の模式図に反映した（番号のみの施設は推定）。来園前・当日朝に必ず公式情報を確認すること。",
  "officialUrl": "https://www.harmonyland.jp/",
  "defaultTab": "home",
  "showUnconfirmedWarnings": true
 },
 "facilities": [
  {
   "id": "kitty-castle",
   "name": "キティキャッスル",
   "kana": "",
   "category": "attraction",
   "area": "ハーモニーパーク",
   "description": "ハーモニーパークにあるお城の施設（地図の1番）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.725,
    "y": 0.38,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 7,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "rhythmic-coaster",
   "name": "リズミックコースター",
   "kana": "",
   "category": "attraction",
   "area": "ハーモニーパーク（推定）",
   "description": "コースター（地図の2番と推定）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.828,
    "y": 0.465,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "雨天運休",
    "weatherSuspend": [
     "rain"
    ]
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": 4,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": true,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "harmony-train",
   "name": "ハーモニートレイン",
   "kana": "",
   "category": "attraction",
   "area": "ハーモニーパーク駅／カーニバルスクエア駅",
   "description": "園内を走る列車。ハーモニーパーク駅とカーニバルスクエア駅がある（地図の3番）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.648,
    "y": 0.478,
    "positionStatus": "confirmed",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の「ハーモニーパーク駅」の表記位置",
    "extraPoints": [
     {
      "x": 0.228,
      "y": 0.405,
      "label": "カーニバルスクエア駅",
      "positionStatus": "confirmed"
     }
    ]
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "雨天運休",
    "weatherSuspend": [
     "rain"
    ]
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": true,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010",
    "source-faq"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "sky-pal-collection",
   "name": "Sky Pal Collection",
   "kana": "",
   "category": "attraction",
   "area": "ネイチャーエリア付近（推定）",
   "description": "地図の4番と推定。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.573,
    "y": 0.335,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": "1回500円",
    "ageMin": 5,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": "110kg以下",
    "pregnancyNotAllowed": null,
    "otherConditions": "ほかにも条件あり（公式の最新案内で確認）",
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "fun-studio",
   "name": "キャラクターグリーティング ファンスタジオ",
   "kana": "",
   "category": "greeting",
   "area": "ハーモニーパーク（推定）",
   "description": "キャラクターと交流できるグリーティング施設（地図の5番と推定）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.803,
    "y": 0.518,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": true,
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "整理券が必要（公式FAQ）。"
   },
   "admission": {
    "type": "整理券",
    "required": true,
    "requiredNote": "公式FAQで整理券が必要と案内。2026年6月15日の公式Xで、6月22日から「デジタル整理券」に変わると告知。",
    "method": "デジタル整理券（2026年6月22日〜と告知）",
    "methodStatus": "scheduled",
    "distributionLocation": null,
    "distributionStartTime": null,
    "participationTime": null,
    "fee": null,
    "endCondition": null,
    "capacity": null,
    "eligibility": null,
    "pastInfo": "公式の過去資料には「ファンスタジオ前特設ブース」で配布した例がある（デジタル化前・当日の情報ではない）。",
    "status": "day_of_check",
    "statusNote": "取得方法・開始時刻・受付終了条件はイベントや当日の運営で変わる。当日の公式案内で確認。"
   },
   "tags": [
    "グリーティング",
    "整理券"
   ],
   "notes": [
    "有料・事前予約制のイベント（ウィッシュミーメル15周年、ハロウィーン関連）も行われる。整理券とは別の手続き。",
    "対象日の出演キャラクターと時間はファンスタジオ キャラクタースケジュール（公式）で確認。"
   ],
   "sources": [
    "source-faq",
    "source-x-digital-ticket",
    "source-digital-ticket-news",
    "source-funstudio-schedule",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "ev-go-kart",
   "name": "サンリオEVゴーカート",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "地図の6番と推定。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.793,
    "y": 0.285,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": "1台500円",
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": "定員2名",
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "wonder-panorama",
   "name": "大観覧車 ワンダーパノラマ",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア",
   "description": "大観覧車（地図の7番・観覧車の絵）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.825,
    "y": 0.11,
    "positionStatus": "reference",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図の7番の観覧車の絵の位置。地図上の番号と公式アトラクション一覧の掲載順が一致すると仮定した推定（1・3・7番は絵柄・駅名と一致）"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "強風時運休",
    "weatherSuspend": [
     "wind"
    ]
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 7,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "angel-coaster",
   "name": "ハローキティのエンジェルコースター",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "コースター。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "雨天運休",
    "weatherSuspend": [
     "rain"
    ]
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": 3,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": true,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認のためマップには表示していない。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "sky-jet",
   "name": "スカイジェット",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "乗り物。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "雨天でも利用できる場合があるが、濡れる可能性がある（公式FAQ）",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 10,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010",
    "source-faq"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "water-shot",
   "name": "ウォーターショット",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "乗り物。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "雨天運休",
    "weatherSuspend": [
     "rain"
    ]
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 4,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010",
    "source-faq"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "strawberry-cafe",
   "name": "ストロベリーカフェ",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "乗り物（飲食店ではありません）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 6,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "fairy-kitty-carousel",
   "name": "フェアリーキティカルーセル",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "メリーゴーラウンド。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 4,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "popn-smile",
   "name": "ポップンスマイル",
   "kana": "",
   "category": "attraction",
   "area": "ホワイトバーズスクエア（推定）",
   "description": "乗り物。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 6,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [
    "地図の8〜14番のどれかと推定されるが、番号との対応は未確認。"
   ],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "sanrio-boat-ride",
   "name": "サンリオキャラクターボートライド",
   "kana": "",
   "category": "attraction",
   "area": "カーニバルスクエア",
   "description": "ボートの乗り物。のりばはカーニバルスクエア。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.27,
    "y": 0.555,
    "positionStatus": "confirmed",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の「サンリオキャラクターボートライドのりば」の表記位置"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": 7,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": "公式アトラクション一覧の掲載内容（利用者提供資料による）。当日の運行・料金は要確認。"
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-attraction",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "harmony-village",
   "name": "ハーモニービレッジ",
   "kana": "",
   "category": "show",
   "area": "ハーモニービレッジ",
   "description": "ハロウィーンのパレード・Magical Masquerade・ゴーストキティグリーティングの会場として案内されている場所。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.66,
    "y": 0.7,
    "positionStatus": "confirmed",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の「ハーモニービレッジ」エリア（ドーム付近）。会場の正確な範囲は未確認"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "ショー会場",
    "パレード"
   ],
   "notes": [
    "ハロウィーンDEダイコウシン★の受付は「ハーモニービレッジ・パレードゲート付近」（パレードゲートの位置は未確認）。"
   ],
   "sources": [
    "source-halloween-2026",
    "source-prtimes-halloween-2026"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "festival-stage",
   "name": "フェスティバルステージ",
   "kana": "",
   "category": "show",
   "area": "ハーモニーガーデン",
   "description": "ハーモニーガーデンにあるステージ。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": 0.315,
    "y": 0.7,
    "positionStatus": "confirmed",
    "positionSource": "利用者提供の園内マップ画像（2026年10月10日受領）",
    "positionNote": "地図上の「フェスティバルステージ」の表記付近"
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [
    "対象日のショーの会場として案内されている情報はない。"
   ],
   "sources": [
    "source-user-map"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "plaza-stage",
   "name": "プラザステージ",
   "kana": "",
   "category": "show",
   "area": null,
   "description": "ハロウィーン関連ショーの会場として案内されているステージ。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [
    "マップ上の位置は未確認。"
   ],
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "harvest-table",
   "name": "ハーベストテーブル",
   "kana": "",
   "category": "restaurant",
   "area": null,
   "description": "レストラン。子ども用イスあり（公式FAQ）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "子ども用イス",
    "離乳食持ち込み可"
   ],
   "notes": [
    "公式FAQの子ども用イスの記載：「ハーベストテーブル、のみに子ども用イスあり」（資料の表記のまま。ほかの店名が抜けている可能性あり）。",
    "レストランへの離乳食の持ち込みは可能（公式FAQ）。",
    "地図の「森の国ハーベストハウス」と同じ建物かは未確認。"
   ],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "country-market",
   "name": "カントリーマーケット",
   "kana": "",
   "category": "shop",
   "area": null,
   "description": "ショップ。ハロウィーンの参加グッズ（マスク・リングライト）の販売場所として案内。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-halloween-2026"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "sanrio-character-collection",
   "name": "サンリオキャラクターコレクション",
   "kana": "",
   "category": "shop",
   "area": null,
   "description": "ショップ。ハロウィーンの参加グッズの販売場所として案内。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-halloween-2026"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "sanrio-nakayoku-shop",
   "name": "サンリオnakayokuショップ",
   "kana": "",
   "category": "shop",
   "area": null,
   "description": "ショップ。ハロウィーンの参加グッズの販売場所として案内。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-halloween-2026"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "information",
   "name": "インフォメーション",
   "kana": "",
   "category": "service",
   "area": null,
   "description": "迷子・困りごとの相談、ベビーカー・車いすの貸し出し、紙おむつの販売。横にベビーセンターがある。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "迷子",
    "ベビーカー",
    "車いす",
    "紙おむつ",
    "キーワード探し"
   ],
   "notes": [
    "A型ベビーカー貸し出し：生後2か月〜3歳・15kg以下、1日500円、台数限り・予約不可。",
    "車いす貸し出し：1台300円、台数限り・予約不可。",
    "紙おむつ販売：Lサイズ4枚入り350円（掲載価格）。粉ミルクの販売はなし。",
    "SCREAM!!フォトスポットとキーワード探しの場所のひとつ（ハロウィーン期間）。"
   ],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "game-plaza",
   "name": "ゲームプラザ",
   "kana": "",
   "category": "service",
   "area": "ホワイトバーズスクエア",
   "description": "ホワイトバーズスクエアにある施設。横に授乳室（ベビーセンター）があり、紙おむつも販売。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "紙おむつ"
   ],
   "notes": [],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "coin-locker",
   "name": "コインロッカー",
   "kana": "",
   "category": "service",
   "area": null,
   "description": "荷物の保管。数に限りがある。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [],
   "notes": [],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "baby-center-information",
   "name": "ベビーセンター（インフォメーション横）",
   "kana": "",
   "category": "family",
   "area": null,
   "description": "授乳室・おむつ交換用ベビーベッド・給湯器あり。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "授乳室",
    "おむつ替え",
    "お湯",
    "ベビー"
   ],
   "notes": [
    "男性は入室できない（公式FAQ）。",
    "給湯器あり（粉ミルクの販売はなし）。"
   ],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "baby-center-gameplaza",
   "name": "授乳室・ベビーセンター（ゲームプラザ横）",
   "kana": "",
   "category": "family",
   "area": "ホワイトバーズスクエア",
   "description": "ホワイトバーズスクエアのゲームプラザ横。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "授乳室",
    "おむつ替え",
    "ベビー"
   ],
   "notes": [
    "男性の入室可否・設備の詳細はインフォメーション横のベビーセンターと同じかは未確認。"
   ],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "restrooms",
   "name": "トイレ（各エリア）",
   "kana": "",
   "category": "family",
   "area": "各エリア",
   "description": "各エリアの女性用・身障者用トイレにベビーベッドあり（公式FAQ）。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "トイレ",
    "おむつ替え",
    "ベビーベッド"
   ],
   "notes": [
    "個々のトイレの位置は未確認。園内の案内表示や公式マップで確認してください。"
   ],
   "sources": [
    "source-faq",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  },
  {
   "id": "scream-photo-spot",
   "name": "SCREAM!!フォトスポット",
   "kana": "",
   "category": "photo",
   "area": "ハーモニーパーク／インフォメーション前など",
   "description": "ハロウィーン期間のフォトスポット。ハーモニーパーク、インフォメーション前など。",
   "infoStatus": "reference",
   "location": {
    "mapType": "relative",
    "x": null,
    "y": null,
    "positionStatus": "unverified",
    "positionSource": null,
    "positionNote": null
   },
   "operation": {
    "status": "day_of_check",
    "openingTime": null,
    "closingTime": null,
    "weatherPolicy": "unconfirmed",
    "weatherSuspend": []
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "ageMin": null,
    "guardianUnder": null,
    "heightRestriction": null,
    "weightRestriction": null,
    "pregnancyNotAllowed": null,
    "otherConditions": null,
    "note": null
   },
   "admission": null,
   "tags": [
    "ハロウィーン",
    "フォトスポット"
   ],
   "notes": [
    "開催期間：2026年9月18日〜11月10日（ハロウィーンイベント期間）。"
   ],
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null,
   "validFrom": null,
   "validUntil": null
  }
 ],
 "shows": [
  {
   "id": "ghost-kitty-greeting-2026",
   "name": "ゴーストキティグリーティング",
   "category": "greeting",
   "description": "ハロウィーン期間のグリーティング。撮影エリアの外周から撮影する方式。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "unknown",
   "announcedTimes": [
    {
     "dayType": "all",
     "startTime": null,
     "endTime": null,
     "label": "開園から約20分",
     "note": "開園直後に実施と案内（開園時刻は当日確認）"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "ハーモニービレッジ",
    "facilityId": "harmony-village"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "viewingConditions": null
   },
   "admission": null,
   "characters": [],
   "viewingRules": [
    "キャラクターと並んでの撮影は不可",
    "撮影エリアの外周から撮影する",
    "撮影後は他のゲストに場所を譲る"
   ],
   "goods": [],
   "notes": [
    "10月13日の開催・出演内容は当日情報で確認。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "wishmemell-15th-special-greeting",
   "name": "ウィッシュミーメル15周年 スペシャルグリーティング",
   "category": "greeting",
   "description": "ウィッシュミーメル15周年の有料グリーティング。参加券1枚につき約1分間の写真・動画撮影、ノベルティあり。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-10-13"
   },
   "days": "unknown",
   "announcedTimes": [
    {
     "dayType": "all",
     "startTime": "10:30",
     "endTime": "10:50",
     "note": "公式ページの掲載時間"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "キャラクターグリーティング ファンスタジオ",
    "facilityId": "fun-studio"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": true,
    "price": "3,500円",
    "viewingConditions": null
   },
   "admission": {
    "type": "事前予約（有料）",
    "required": true,
    "requiredNote": "有料・事前予約制と公式ページで案内。",
    "method": "有料・事前予約制",
    "methodStatus": "scheduled",
    "distributionLocation": null,
    "distributionStartTime": null,
    "participationTime": "10:30〜10:50（掲載時間）",
    "fee": "3,500円",
    "endCondition": null,
    "capacity": null,
    "eligibility": null,
    "pastInfo": null,
    "status": "day_of_check",
    "statusNote": "10月13日は掲載期間の最終日。予約の可否・空き状況を確認。予約がない場合に参加できるとは限らない。"
   },
   "characters": [
    "ウィッシュミーメル"
   ],
   "viewingRules": [],
   "goods": [],
   "notes": [
    "10月13日は掲載期間の最終日。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-wi15th",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "halloween-de-daikoushin-2026",
   "name": "ハロウィーンDEダイコウシン★",
   "category": "show",
   "description": "ハロウィーン衣装のキャラクターたちと一緒に大行進する、平日限定の参加型ショー。出演キャラクターは日替わりと案内。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "weekday",
   "announcedTimes": [
    {
     "dayType": "weekday",
     "startTime": "11:00",
     "endTime": "11:20",
     "note": "平日の開催時間として案内"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "未確認（受付はハーモニービレッジ・パレードゲート付近）",
    "facilityId": "harmony-village"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": false,
    "price": null,
    "viewingConditions": null
   },
   "admission": {
    "type": "当日受付",
    "required": true,
    "requiredNote": "参加には当日の受付が必要と公式ページで案内。",
    "method": "当日先着受付（事前予約なし）",
    "methodStatus": "scheduled",
    "distributionLocation": "ハーモニービレッジ・パレードゲート付近",
    "distributionStartTime": "10:30〜（掲載時刻）",
    "participationTime": "11:00〜（平日の掲載時刻）",
    "fee": null,
    "endCondition": "定員に達した時点で受付終了",
    "capacity": "約90名",
    "eligibility": null,
    "pastInfo": null,
    "status": "day_of_check",
    "statusNote": "10月13日の開催有無・受付時刻は当日の公式スケジュールで確認。"
   },
   "characters": [],
   "viewingRules": [
    "参加しながらの撮影は不可"
   ],
   "goods": [],
   "notes": [],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "parade-parallel-halloween-2026",
   "name": "パレードパラレル〜ハロウィーンver.〜",
   "category": "parade",
   "description": "約10年続いたパレードの集大成「パレードパラレル the FINAL」のハロウィーン版。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "all",
   "announcedTimes": [
    {
     "dayType": "all",
     "startTime": "12:30",
     "endTime": "12:55",
     "note": "通常の開催時間（10月31日・11月1日は12:45〜）"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "ハーモニービレッジ",
    "facilityId": "harmony-village"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "viewingConditions": null
   },
   "admission": null,
   "characters": [],
   "viewingRules": [],
   "goods": [],
   "notes": [],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010",
    "source-prtimes-parade-final"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "fun-studio-halloween-2026",
   "name": "ファンスタジオのハロウィーン有料グリーティング（正式名称未確認）",
   "category": "greeting",
   "description": "ファンスタジオで行われる、別枠の有料・事前予約制のハロウィーン関連イベント。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "unknown",
   "announcedTimes": [
    {
     "dayType": "all",
     "startTime": "13:30",
     "endTime": "13:50",
     "note": "公式ページの掲載例（対象日の実施は未確認）"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "キャラクターグリーティング ファンスタジオ",
    "facilityId": "fun-studio"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": true,
    "price": "3,500円",
    "viewingConditions": null
   },
   "admission": {
    "type": "事前予約（有料）",
    "required": true,
    "requiredNote": "有料・事前予約制の別枠イベントとして公式ページで案内。",
    "method": "有料・事前予約制",
    "methodStatus": "scheduled",
    "distributionLocation": null,
    "distributionStartTime": null,
    "participationTime": "13:30〜13:50（掲載例）",
    "fee": "3,500円",
    "endCondition": null,
    "capacity": null,
    "eligibility": null,
    "pastInfo": null,
    "status": "day_of_check",
    "statusNote": "予約対象日・空き状況・参加条件を確認。"
   },
   "characters": [],
   "viewingRules": [],
   "goods": [],
   "notes": [
    "PR TIMESで告知された「パレードパラレル the FINAL」のシーズン衣装の有料スペシャルグリーティングと同じものかは未確認。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "plaza-stage-halloween-2026",
   "name": "プラザステージのハロウィーンショー（正式名称未確認）",
   "category": "show",
   "description": "プラザステージで行われるハロウィーン関連ショー。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "all",
   "announcedTimes": [
    {
     "dayType": "weekday",
     "startTime": "15:00",
     "endTime": null,
     "note": "平日の掲載時刻"
    },
    {
     "dayType": "holiday",
     "startTime": "11:00",
     "endTime": null,
     "note": "土日祝の掲載時刻"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "プラザステージ",
    "facilityId": "plaza-stage"
   },
   "requirements": {
    "ticketRequired": false,
    "reservationRequired": "unknown",
    "price": "観覧は無料かは未確認。最前列は有料券1,000円",
    "viewingConditions": null
   },
   "admission": {
    "type": "最前列有料券（任意）",
    "required": "optional",
    "requiredNote": "最前列で見たい場合のみ。",
    "method": "ショー開始30分前から会場付近で数量限定販売",
    "methodStatus": "scheduled",
    "distributionLocation": "会場付近",
    "distributionStartTime": "ショー開始の30分前から",
    "participationTime": null,
    "fee": "1,000円",
    "endCondition": "数量限定",
    "capacity": null,
    "eligibility": null,
    "pastInfo": null,
    "status": "day_of_check",
    "statusNote": "10月13日の実施・販売の有無は当日確認。"
   },
   "characters": [],
   "viewingRules": [],
   "goods": [],
   "notes": [
    "10月31日・11月1日は実施なし。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "magical-masquerade-excite-2026",
   "name": "Magical Masquerade〜EXCITE！〜",
   "category": "show",
   "description": "コール＆レスポンスやダンスで参加するハロウィーンのライブショー。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "all",
   "announcedTimes": [
    {
     "dayType": "weekday",
     "startTime": "16:00",
     "endTime": "16:20",
     "note": "平日の上演時刻"
    },
    {
     "dayType": "holiday",
     "startTime": "15:15",
     "endTime": "15:35",
     "note": "土日祝の上演時刻（10月31日・11月1日は別時刻の案内あり）"
    }
   ],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "ハーモニービレッジ",
    "facilityId": "harmony-village"
   },
   "requirements": {
    "ticketRequired": false,
    "reservationRequired": false,
    "price": null,
    "viewingConditions": null
   },
   "admission": null,
   "characters": [
    "ハローキティ",
    "マイメロディ",
    "クロミ",
    "シナモロール",
    "ポムポムプリン",
    "ウィッシュミーメル"
   ],
   "viewingRules": [
    "前方の指定エリアではダンスや移動への参加が必要",
    "前方エリアでは一眼レフ・ビデオカメラの使用は禁止",
    "スマートフォンでの撮影は可能。三脚・伸ばした自撮り棒は使用不可",
    "ベビーカーは後方の指定エリアで使用",
    "手荷物は小さくまとめる",
    "荷物だけで場所取りをしない",
    "現場スタッフの案内に従う"
   ],
   "goods": [
    {
     "name": "マジカルマスカレードマスク",
     "price": "1,320円"
    },
    {
     "name": "リングライト",
     "price": "1,760円"
    },
    {
     "name": "販売場所",
     "price": "カントリーマーケット、サンリオキャラクターコレクション、サンリオnakayokuショップ"
    }
   ],
   "notes": [],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-prtimes-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "halloween-keyword-hunt-2026",
   "name": "ハロウィーン キーワード探し",
   "category": "event",
   "description": "園内のキーワードを探す参加型の企画。移動の合間に参加できる。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2026-11-10"
   },
   "days": "all",
   "announcedTimes": [],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "改札ゲートラック、インフォメーション、園内ショップ3店舗",
    "facilityId": "information"
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": "unknown",
    "price": null,
    "viewingConditions": null
   },
   "admission": null,
   "characters": [],
   "viewingRules": [],
   "goods": [],
   "notes": [
    "時間指定はない企画として扱っている（実施時間は未確認）。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-halloween-2026",
    "source-user-doc-20261010"
   ],
   "lastVerifiedAt": null
  },
  {
   "id": "parade-final-special-greeting-2026",
   "name": "パレードパラレル the FINAL スペシャルグリーティング",
   "category": "greeting",
   "description": "シーズン限定衣装のキャラクターと会える有料のグリーティング。",
   "eventPeriod": {
    "startDate": "2026-09-18",
    "endDate": "2027-05-09"
   },
   "days": "unknown",
   "announcedTimes": [],
   "schedule": [
    {
     "date": "2026-10-13",
     "startTime": null,
     "endTime": null,
     "status": "day_of_check"
    }
   ],
   "venue": {
    "name": "未確認",
    "facilityId": null
   },
   "requirements": {
    "ticketRequired": "unknown",
    "reservationRequired": true,
    "price": "有料（金額未確認）",
    "viewingConditions": null
   },
   "admission": {
    "type": "事前予約（有料）",
    "required": true,
    "requiredNote": "有料・事前予約制と案内。",
    "method": null,
    "methodStatus": null,
    "distributionLocation": null,
    "distributionStartTime": null,
    "participationTime": null,
    "fee": null,
    "endCondition": null,
    "capacity": null,
    "eligibility": null,
    "pastInfo": null,
    "status": "day_of_check",
    "statusNote": "予約方法・料金・対象日の実施は未確認。"
   },
   "characters": [],
   "viewingRules": [],
   "goods": [],
   "notes": [
    "上の「ファンスタジオのハロウィーン有料グリーティング」と同じものかは未確認。"
   ],
   "weatherPolicy": "unconfirmed",
   "sources": [
    "source-prtimes-parade-final"
   ],
   "lastVerifiedAt": null
  }
 ],
 "sources": [
  {
   "id": "source-official-top",
   "title": "ハーモニーランド公式サイト",
   "target": "営業カレンダー・営業時間・お知らせ全般",
   "url": "https://www.harmonyland.jp/",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "開発環境から接続できず本文未確認",
   "applicableDate": "2026-10-13",
   "verificationStatus": "unconfirmed",
   "notes": "対象日の営業カレンダー・営業時間はこのページから確認する。"
  },
  {
   "id": "source-attraction",
   "title": "アトラクション一覧（公式）",
   "target": "アトラクションの名称・利用条件（年齢・妊娠中・体重）・料金",
   "url": "https://www.harmonyland.jp/attraction",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": "2026-10-10",
   "checkMethod": "2026年10月10日に利用者から提供された統合資料で、公式ページの記載内容として報告されたもの。アプリ作成者は開発環境から公式サイトに接続できず、本文を直接は確認していない。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "reference",
   "notes": "利用条件は恒久データとして保持。当日の運行・料金は当日確認。"
  },
  {
   "id": "source-faq",
   "title": "よくあるご質問（公式FAQ）",
   "target": "整理券・雨天運休・ベビーセンター・貸し出し・駐車場など",
   "url": "https://www.harmonyland.jp/faq",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": "2026-10-10",
   "checkMethod": "2026年10月10日に利用者から提供された統合資料で、公式ページの記載内容として報告されたもの。アプリ作成者は開発環境から公式サイトに接続できず、本文を直接は確認していない。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "reference",
   "notes": "雨天運休の施設、ベビーセンターの場所、貸し出し料金などを掲載。料金・運用は変更される場合がある。"
  },
  {
   "id": "source-funstudio-schedule",
   "title": "ファンスタジオ キャラクタースケジュール（公式）",
   "target": "ファンスタジオの出演キャラクター・時間",
   "url": "https://www.harmonyland.jp/sp/funstudio/c_schedule.html",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "開発環境から接続できず本文未確認",
   "applicableDate": "2026-10-13",
   "verificationStatus": "unconfirmed",
   "notes": "対象日の出演キャラクター・時間はこのページで確認する。"
  },
  {
   "id": "source-digital-ticket-news",
   "title": "ファンスタジオ デジタル整理券のお知らせ（公式）",
   "target": "ファンスタジオの整理券の取得方法",
   "url": "https://www.harmonyland.jp/news/19966",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "公式Xの告知で参照先として案内されていることを検索結果で確認（本文未確認）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "unconfirmed",
   "notes": "デジタル整理券の取得手順・開始時刻はこのページで確認する。"
  },
  {
   "id": "source-x-digital-ticket",
   "title": "公式X：ファンスタジオ整理券のデジタル化告知",
   "target": "ファンスタジオの整理券方式の変更",
   "url": "https://x.com/harmony_event/status/2066445657607700582",
   "publisher": "ハーモニーランド【公式】（@harmony_event）",
   "official": true,
   "publishedAt": "2026-06-15",
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "検索結果の要約で内容を確認（投稿本文は未確認）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "2026年6月22日からファンスタジオの整理券が「デジタル整理券」に変わると案内。対象日の運用は未確認。"
  },
  {
   "id": "source-halloween-2026",
   "title": "Harmonyland Halloween 2026 特設ページ（公式）",
   "target": "ハロウィーンイベントのショー・パレード",
   "url": "https://www.harmonyland.jp/sp/halloween2026/index.html",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": "2026-10-10",
   "checkMethod": "2026年10月10日に利用者から提供された統合資料で、公式ページの記載内容として報告されたもの。アプリ作成者は開発環境から公式サイトに接続できず、本文を直接は確認していない。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "開催期間・上演時刻・会場・出演キャラクター・観覧ルール・参加グッズ・受付方法を掲載。対象日の個別スケジュールは当日確認。"
  },
  {
   "id": "source-prtimes-halloween-2026",
   "title": "プレスリリース：ハロウィーンイベント『HARMONYLAND HALLOWEEN』2026年9月18日（金）よりスタート",
   "target": "ハロウィーンイベントの概要・ショーの上演時刻",
   "url": "https://prtimes.jp/main/html/rd/p/000000535.000007643.html",
   "publisher": "PR TIMES（ハーモニーランドの公式プレスリリース）",
   "official": true,
   "publishedAt": "2026-08-21",
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "検索結果の要約で内容を確認（本文未確認）。公開日は転載記事のURLの日付から判断。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "開催期間 2026年9月18日〜11月10日。Magical Masquerade〜EXCITE！〜 は平日16:00〜16:20／土日祝15:15〜15:35（ハーモニービレッジ）と案内。"
  },
  {
   "id": "source-prtimes-parade-final",
   "title": "プレスリリース：「パレードパラレル the FINAL」2026年9月18日（金）スタート",
   "target": "パレードパラレルの開催期間・シーズン",
   "url": "https://prtimes.jp/main/html/rd/p/000000537.000007643.html",
   "publisher": "PR TIMES（ハーモニーランドの公式プレスリリース）",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "検索結果の要約で内容を確認（本文未確認）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "パレードパラレル the FINAL は2026年9月18日〜2027年5月9日。ハロウィーンver.は9月18日〜11月10日。シーズン衣装の有料スペシャルグリーティング（事前予約制）の案内あり。"
  },
  {
   "id": "source-prtimes-halloween-report",
   "title": "プレスリリース：『HARMONYLAND HALLOWEEN』2026年9月18日（金）初日レポート",
   "target": "ハロウィーンイベント初日の様子",
   "url": "https://prtimes.jp/main/html/rd/p/000000543.000007643.html",
   "publisher": "PR TIMES（ハーモニーランドの公式プレスリリース）",
   "official": true,
   "publishedAt": "2026-09-18",
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "検索結果の要約で内容を確認（本文未確認）。公開日は転載記事のURLの日付から判断。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "期間限定フードの紹介あり。提供店舗は未確認。"
  },
  {
   "id": "source-digital-map",
   "title": "ハーモニーランド デジタルマップ（platinumaps）",
   "target": "園内の施設位置",
   "url": "https://platinumaps.jp/d/harmonyland?culture=ja",
   "publisher": "未確認（platinumaps 上の「ハーモニーランド デジタルマップ」）",
   "official": false,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": "2026-10-10",
   "checkMethod": "検索結果でページの存在のみ確認（本文未確認）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "unconfirmed",
   "notes": "公式が提供するものかは未確認。施設の位置の参考として外部リンクのみ掲載し、内容は複製していない。"
  },
  {
   "id": "source-wi15th",
   "title": "ウィッシュミーメル15周年 特設ページ（公式）",
   "target": "ウィッシュミーメル15周年スペシャルグリーティング",
   "url": "https://www.harmonyland.jp/sp/wi15th/index.html",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": null,
   "checkMethod": "2026年10月10日に利用者から提供された統合資料で、公式ページの記載内容として報告されたもの。アプリ作成者は開発環境から公式サイトに接続できず、本文を直接は確認していない。",
   "applicableDate": "2026-10-13",
   "verificationStatus": "scheduled",
   "notes": "掲載期間 2026年9月18日〜10月13日、10:30〜10:50、ファンスタジオ、3,500円、有料・事前予約制。"
  },
  {
   "id": "source-schedule-pdf-2026-04",
   "title": "公式の月間スケジュールPDF（2026年4月掲載・過去資料）",
   "target": "施設名・整理券の配布場所などの補足",
   "url": "https://www.harmonyland.jp/wp/wp-content/uploads/2026/04/e2e6e40eaaa7d6de5651df945fcc25c3.pdf",
   "publisher": "ハーモニーランド",
   "official": true,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": null,
   "searchedAt": null,
   "checkMethod": "利用者提供資料で参考資料として紹介（本文未確認）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "reference",
   "notes": "過去の資料。時間や運休情報を対象日にそのまま流用しない。"
  },
  {
   "id": "source-user-doc-20261010",
   "title": "利用者提供：情報補完・攻略データ統合資料（2026年10月10日作成）",
   "target": "公式ページの記載内容のまとめ",
   "url": null,
   "publisher": "アプリ利用者",
   "official": false,
   "publishedAt": "2026-10-10",
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": null,
   "checkMethod": "公式サイト・公式FAQ・イベントページの内容をまとめた資料として受領",
   "applicableDate": "2026-10-13",
   "verificationStatus": "reference",
   "notes": "各項目は資料が示す公式ページを出典として併記している。"
  },
  {
   "id": "source-user-map",
   "title": "利用者提供：園内マップ画像（2026年10月10日受領）",
   "target": "施設・エリアの相対位置",
   "url": null,
   "publisher": "未確認（公式マップと思われる画像）",
   "official": false,
   "publishedAt": null,
   "updatedAt": null,
   "checkedAt": "2026-10-10",
   "searchedAt": null,
   "checkMethod": "画像上の表記・番号の位置を読み取り、独自の模式図に反映（画像そのものはアプリに含めていない）",
   "applicableDate": "2026-10-13",
   "verificationStatus": "reference",
   "notes": "画像の作成時期は不明。番号と施設名の対応表がないため、表記のない番号は公式アトラクション一覧の掲載順からの推定。"
  }
 ],
 "opening-info": {
  "date": "2026-10-13",
  "status": "day_of_check",
  "isOpen": "unknown",
  "openingTime": null,
  "closingTime": null,
  "lastEntryTime": null,
  "closures": [],
  "notes": [
   {
    "text": "10月13日の営業時間・最終入園時刻は公式の営業カレンダーで確認できていません（当日要確認）。",
    "status": "day_of_check"
   },
   {
    "text": "休園日は不定休と案内されています。来園前に公式サイトの営業カレンダーを確認してください。",
    "status": "day_of_check"
   }
  ],
  "weather": {
   "text": "雨天運休と公式FAQに掲載：リズミックコースター、ハーモニートレイン、ハローキティのエンジェルコースター、ウォーターショット。スカイジェットは雨でも利用できる場合あり（濡れる可能性）。観覧車は強風時運休。天候だけで運行可否は断定できないため、当日の運行状況を確認。",
   "status": "reference"
  },
  "sources": [
   "source-official-top",
   "source-faq"
  ],
  "lastVerifiedAt": null
 },
 "park-info": {
  "parkInfo": [
   {
    "title": "お金",
    "items": [
     "園内にATMはない。"
    ],
    "sources": [
     "source-faq"
    ]
   },
   {
    "title": "駐車場",
    "items": [
     "普通車600円。",
     "一度退出すると、再度駐車料金が必要。"
    ],
    "sources": [
     "source-faq"
    ]
   },
   {
    "title": "貸し出し（インフォメーション）",
    "items": [
     "A型ベビーカー：生後2か月〜3歳・15kg以下、1日500円。台数限り・予約不可。",
     "車いす：1台300円。台数限り・予約不可。"
    ],
    "sources": [
     "source-faq"
    ]
   },
   {
    "title": "赤ちゃん",
    "items": [
     "ベビーセンター・授乳室：インフォメーション横／ホワイトバーズスクエアのゲームプラザ横。",
     "男性はベビーセンター内に入室できない。",
     "おむつ交換：ベビーセンターのほか、各エリアの女性用・身障者用トイレにベビーベッドあり。",
     "紙おむつ：インフォメーション・ゲームプラザで販売（Lサイズ4枚入り350円）。粉ミルクは販売なし。",
     "お湯：ベビーセンター内に給湯器あり。"
    ],
    "sources": [
     "source-faq"
    ]
   },
   {
    "title": "食事",
    "items": [
     "子ども用イス：ハーベストテーブルにあり（資料の表記「ハーベストテーブル、のみに子ども用イスあり」）。",
     "レストランへの離乳食の持ち込みは可能。"
    ],
    "sources": [
     "source-faq"
    ]
   },
   {
    "title": "そのほか",
    "items": [
     "迷子や困りごとはインフォメーションへ。",
     "コインロッカーあり（数に限りあり）。",
     "キャリーワゴンなど持ち込み禁止のカート類がある。"
    ],
    "sources": [
     "source-faq"
    ]
   }
  ],
  "status": "reference",
  "statusNote": "公式FAQの掲載内容（利用者提供資料による）。料金・設備の運用は変更される場合があるため、来園前に公式FAQを確認。",
  "priorityTicketChecks": [
   "対象施設",
   "販売券種",
   "販売開始時刻",
   "販売場所",
   "価格",
   "販売枚数・受付終了条件",
   "事前購入の可否",
   "対象時間帯"
  ],
  "checklists": [
   {
    "id": "before",
    "title": "来園前に確認",
    "items": [
     [
      "hours",
      "10月13日の営業時間"
     ],
     [
      "lastentry",
      "最終入園時刻"
     ],
     [
      "showsched",
      "当日のライブショースケジュール"
     ],
     [
      "masq",
      "Magical Masqueradeの開催"
     ],
     [
      "daiko",
      "ダイコウシンの開催・受付"
     ],
     [
      "parade",
      "パレードの開催"
     ],
     [
      "plaza",
      "プラザステージのイベント"
     ],
     [
      "wish",
      "ウィッシュミーメルの予約イベント"
     ],
     [
      "funstudio",
      "ファンスタジオの整理券・予約条件"
     ],
     [
      "rides",
      "アトラクションの運行状況"
     ],
     [
      "priority",
      "優先券・有料券の販売情報"
     ],
     [
      "weather",
      "天気・雨天運休条件"
     ],
     [
      "map",
      "施設の場所を示す公式マップ"
     ]
    ]
   },
   {
    "id": "inpark",
    "title": "園内で確認",
    "items": [
     [
      "ticketend",
      "整理券の受付終了"
     ],
     [
      "venue",
      "ショーの会場案内"
     ],
     [
      "suspend",
      "施設の運休・再開"
     ],
     [
      "restaurant",
      "レストランの営業"
     ],
     [
      "toilet",
      "トイレ・授乳室の場所"
     ],
     [
      "shophours",
      "帰る前にショップの営業時間"
     ]
    ]
   }
  ],
  "modelPlan": [
   {
    "phase": "開園前",
    "items": [
     "営業時間と入園条件を確認",
     "当日のショースケジュールを確認",
     "整理券・予約イベントの受付条件を確認",
     "優先券・有料券の販売条件を確認"
    ]
   },
   {
    "phase": "開園直後",
    "items": [
     "おでむかえグリーティング（ゴーストキティグリーティング：開園から約20分）の実施を確認",
     "当日整理券・受付が必要なイベントの受付場所へ向かう（ダイコウシンは10:30〜受付と掲載）",
     "その後のショー会場への移動時間を確保"
    ]
   },
   {
    "phase": "午前",
    "items": [
     "子どもが希望するアトラクション",
     "待ち時間が短い施設",
     "キャラクターグリーティング",
     "フォトスポット"
    ]
   },
   {
    "phase": "昼",
    "items": [
     "食事・水分補給",
     "ベビーセンターやトイレの利用",
     "午後のショー会場と移動経路を確認"
    ]
   },
   {
    "phase": "午後",
    "items": [
     "12:30頃のパレードが開催される場合は観覧",
     "予約済みイベントへの参加",
     "15:00頃のプラザステージのショーが開催される場合は観覧",
     "16:00頃のMagical Masqueradeを観覧",
     "閉園までにショップや残りのアトラクション"
    ]
   }
  ],
  "modelPlanNote": "時間の目安であり、10月13日の確定スケジュールではない。ショーの重複や移動時間を考えて組み立て直す。",
  "planPriority": [
   "事前予約済みのイベント",
   "当日受付・整理券が必要なイベント",
   "見たいショー",
   "終了時刻が早いアトラクション",
   "子どもが希望するアトラクション",
   "食事・休憩",
   "ショップ・フォトスポット"
  ],
  "sources": [
   "source-faq",
   "source-user-doc-20261010"
  ]
 },
 "links": {
  "note": "リンク先の内容は変わることがあります。アプリからは各ページの最新の内容を確認できないため、必ずリンク先で確認してください。",
  "top": [
   {
    "id": "official-top",
    "icon": "🏠",
    "title": "公式サイト トップ",
    "desc": "営業時間・運行状況・ライブショー・優先券／有料券・お知らせ",
    "url": "https://www.harmonyland.jp/",
    "official": true
   },
   {
    "id": "halloween",
    "icon": "🎃",
    "title": "ハロウィーン2026 特設ページ",
    "desc": "平日の参考時刻：11:00 ダイコウシン（10:30受付）・12:30 パレード・15:00 プラザステージ・16:00 Magical Masquerade。会場・受付方法・観覧ルール",
    "url": "https://www.harmonyland.jp/sp/halloween2026/index.html",
    "official": true
   },
   {
    "id": "funstudio",
    "icon": "🤝",
    "title": "ファンスタジオ キャラクタースケジュール",
    "desc": "その日に会えるキャラクターと時間",
    "url": "https://www.harmonyland.jp/sp/funstudio/c_schedule.html",
    "official": true
   }
  ],
  "sections": [
   {
    "id": "today",
    "icon": "🕒",
    "title": "当日の情報・整理券",
    "items": [
     {
      "id": "x",
      "icon": "📣",
      "title": "公式X（@harmony_event）",
      "desc": "当日のお知らせ・運休・変更をすぐ確認",
      "url": "https://x.com/harmony_event",
      "official": true
     },
     {
      "id": "digital-ticket",
      "icon": "🎫",
      "title": "ファンスタジオ デジタル整理券のお知らせ",
      "desc": "2026年6月22日から整理券がデジタルに。取り方はここで確認",
      "url": "https://www.harmonyland.jp/news/19966",
      "official": true
     }
    ]
   },
   {
    "id": "event",
    "icon": "🎃",
    "title": "イベント（10月13日に関係するもの）",
    "items": [
     {
      "id": "wi15th",
      "icon": "🎀",
      "title": "ウィッシュミーメル15周年 特設ページ",
      "desc": "スペシャルグリーティング（有料・事前予約、10:30〜）。10月13日は掲載期間の最終日",
      "url": "https://www.harmonyland.jp/sp/wi15th/index.html",
      "official": true
     },
     {
      "id": "pr-halloween",
      "icon": "📰",
      "title": "プレスリリース：HARMONYLAND HALLOWEEN",
      "desc": "イベント全体の概要（PR TIMES・2026年8月21日）",
      "url": "https://prtimes.jp/main/html/rd/p/000000535.000007643.html",
      "official": true
     },
     {
      "id": "pr-parade",
      "icon": "📰",
      "title": "プレスリリース：パレードパラレル the FINAL",
      "desc": "パレードのシーズンと有料スペシャルグリーティング（PR TIMES）",
      "url": "https://prtimes.jp/main/html/rd/p/000000537.000007643.html",
      "official": true
     },
     {
      "id": "pr-report",
      "icon": "📰",
      "title": "プレスリリース：ハロウィーン初日レポート",
      "desc": "ショーやハロウィーンメニューの様子（PR TIMES・2026年9月18日）",
      "url": "https://prtimes.jp/main/html/rd/p/000000543.000007643.html",
      "official": true
     }
    ]
   },
   {
    "id": "map",
    "icon": "🗺️",
    "title": "マップ・行き方・天気",
    "items": [
     {
      "id": "digital-map",
      "icon": "🗺️",
      "title": "ハーモニーランド デジタルマップ",
      "desc": "園内の施設の場所（platinumaps。公式提供かは未確認）",
      "url": "https://platinumaps.jp/d/harmonyland?culture=ja",
      "official": false
     },
     {
      "id": "app-map",
      "icon": "📍",
      "title": "このアプリの園内略図",
      "desc": "エリアとおもな施設のおおよその位置。施設名でさがせる",
      "href": "#map",
      "internal": true
     },
     {
      "id": "gmaps",
      "icon": "🚗",
      "title": "Googleマップで場所を開く",
      "desc": "車・電車での行き方と所要時間",
      "url": "https://www.google.com/maps/search/?api=1&query=%E3%82%B5%E3%83%B3%E3%83%AA%E3%82%AA%E3%82%AD%E3%83%A3%E3%83%A9%E3%82%AF%E3%82%BF%E3%83%BC%E3%83%91%E3%83%BC%E3%82%AF%20%E3%83%8F%E3%83%BC%E3%83%A2%E3%83%8B%E3%83%BC%E3%83%A9%E3%83%B3%E3%83%89",
      "official": false
     },
     {
      "id": "weather",
      "icon": "☔",
      "title": "日出町の天気（Google検索）",
      "desc": "雨・強風だと運休するのりものがある",
      "url": "https://www.google.com/search?q=%E5%A4%A7%E5%88%86%E7%9C%8C%E6%97%A5%E5%87%BA%E7%94%BA+%E5%A4%A9%E6%B0%97",
      "official": false
     }
    ]
   },
   {
    "id": "park",
    "icon": "🎡",
    "title": "のりもの・園内のこと",
    "items": [
     {
      "id": "attraction",
      "icon": "🎡",
      "title": "アトラクション一覧（公式）",
      "desc": "年齢・身長などの利用条件、料金",
      "url": "https://www.harmonyland.jp/attraction",
      "official": true
     },
     {
      "id": "faq",
      "icon": "❓",
      "title": "よくある質問（公式FAQ）",
      "desc": "整理券・雨天運休・ベビーセンター・ベビーカー貸し出し・駐車場",
      "url": "https://www.harmonyland.jp/faq",
      "official": true
     },
     {
      "id": "app-today",
      "icon": "🕒",
      "title": "このアプリ：きょうの予定（参考時刻）",
      "desc": "ショーと受付を時間順に。☆でプランに入れられる",
      "href": "#today",
      "internal": true
     }
    ]
   },
   {
    "id": "ref",
    "icon": "📄",
    "title": "参考（過去の資料）",
    "items": [
     {
      "id": "pdf-2026-04",
      "icon": "📄",
      "title": "月間スケジュールPDF（2026年4月）",
      "desc": "過去の資料。時刻や運休はそのまま当日に使わない",
      "url": "https://www.harmonyland.jp/wp/wp-content/uploads/2026/04/e2e6e40eaaa7d6de5651df945fcc25c3.pdf",
      "official": true
     }
    ]
   }
  ]
 }
};
