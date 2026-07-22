export function getSelectCustomerFakeData() {
  return {
    resultCd: '000',
    resultMsg: 'It is succeeded',
    resultDt: '20200226192053',
    data: {
      custList: [
        {
          tin: '841562115',
          taxprNm: 'TAXPAYER1',
          taxprSttsCd: 'A',
          prvncNm: 'KIGALI CITY',
          dstrtNm: 'KICUKIRO',
          sctrNm: 'KAGARAMA',
          locDesc: 'Kicukiro',
        },
        {
          tin: '451848361',
          taxprNm: 'TAXPAYER2',
          taxprSttsCd: 'A',
          prvncNm: 'KIGALI CITY',
          dstrtNm: 'KICUKIRO',
          sctrNm: 'KAGARAMA',
          locDesc: '123-233',
        },
      ],
    },
  }
}

export function getPuchaseFakeData() {
  return {
  resultCd: "000",
  resultMsg: "It is succeeded",
  resultDt: "20200226195420",
  data: {
    saleList: [
      {
        spplrTin: "999991111",
        spplrNm: "Taxpayer Ltd.",
        spplrBhfId: "00",
        spplrInvcNo: 2,
        prcOrdCd: "123456",
        spplrSdcId: "SDC007000001",
        spplrMrcNo: "WIS01000101",
        rcptTyCd: "S",
        pmtTyCd: "01",
        cfmDt: "2020-01-27 21:03:00",
        salesDt: "20200127",
        stockRlsDt: "2020-01-27 21:03:00",
        totItemCnt: 2,

        taxblAmtA: 0,
        taxblAmtB: 10500,
        taxblAmtC: 0,
        taxblAmtD: 0,

        taxRtA: 0,
        taxRtB: 18,
        taxRtC: 0,
        taxRtD: 0,

        taxAmtA: 0,
        taxAmtB: 1890,
        taxAmtC: 0,
        taxAmtD: 0,

        totTaxblAmt: 10500,
        totTaxAmt: 1890,
        totAmt: 12390,

        remark: null,

        itemList: [
          {
            itemSeq: 1,
            itemCd: "ITEM001",
            itemClsCd: "5059690800",
            itemNm: "Sample Item 1",
            bcd: null,
            pkgUnitCd: "NT",
            pkg: 2,
            qtyUnitCd: "U",
            qty: 2,
            prc: 3500,
            splyAmt: 7000,
            dcRt: 0,
            dcAmt: 0,
            taxTyCd: "B",
            taxblAmt: 7000,
            taxAmt: 1260,
            totAmt: 8260
          },
          {
            itemSeq: 2,
            itemCd: "ITEM002",
            itemClsCd: "5022110801",
            itemNm: "Sample Item 2",
            bcd: null,
            pkgUnitCd: "NT",
            pkg: 1,
            qtyUnitCd: "U",
            qty: 1,
            prc: 3500,
            splyAmt: 3500,
            dcRt: 0,
            dcAmt: 0,
            taxTyCd: "B",
            taxblAmt: 3500,
            taxAmt: 630,
            totAmt: 4130
          }
        ]
      }
    ]
  }
}

}
