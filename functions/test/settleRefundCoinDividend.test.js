const { settleRefundCoinDividend, settleIngot, settleRefundIngot } = require('../util/settleModules');

describe('結算退款 搞幣紅利', () => {
  describe('鑽石大神', () => {
    it('鑽石大神 179 89 80 99', () => {
      const diamondData =
        {
          price: '179', 
          sub_price: '89',
          coin: '80', 
          dividend: '99' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 40.22);
      expect(settleResult).toHaveProperty('dividend_real', 49.78);
      expect(settleResult).toHaveProperty('coin', 41);
      expect(settleResult).toHaveProperty('dividend', 49);
    });

    it('鑽石大神 179 89 99 80', () => {
      const diamondData =
        {
          price: '179', 
          sub_price: '89',
          coin: '99', 
          dividend: '80' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 49.78);
      expect(settleResult).toHaveProperty('dividend_real', 40.22);
      expect(settleResult).toHaveProperty('coin', 50);
      expect(settleResult).toHaveProperty('dividend', 40);
    });

    it('鑽石大神 179 89 179 0', () => {
      const diamondData =
        {
          price: '179', 
          sub_price: '89',
          coin: '179', 
          dividend: '0' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 90);
      expect(settleResult).toHaveProperty('dividend_real', 0);
      expect(settleResult).toHaveProperty('coin', 90);
      expect(settleResult).toHaveProperty('dividend', 0);
    });

    it('鑽石大神 179 89 0 179', () => {
      const diamondData =
        {
          price: '179', 
          sub_price: '89',
          coin: '0', 
          dividend: '179' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 0);
      expect(settleResult).toHaveProperty('dividend_real', 90);
      expect(settleResult).toHaveProperty('coin', 0);
      expect(settleResult).toHaveProperty('dividend', 90);
    });
  });

  describe('金大神', () => {
    it('金大神 169 79 100 69', () => {
      const diamondData =
        {
          price: '169', 
          sub_price: '79',
          coin: '100', 
          dividend: '69' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 53.25);
      expect(settleResult).toHaveProperty('dividend_real', 36.75);
      expect(settleResult).toHaveProperty('coin', 54);
      expect(settleResult).toHaveProperty('dividend', 36);
    });

    it('金大神 169 79 69 100', () => {
      const diamondData =
        {
          price: '169', 
          sub_price: '79',
          coin: '69', 
          dividend: '100' 
        };

      const settleResult = modules.settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 36.75);
      expect(settleResult).toHaveProperty('dividend_real', 53.25);
      expect(settleResult).toHaveProperty('coin', 37);
      expect(settleResult).toHaveProperty('dividend', 53);
    });

    it('金大神 169 79 169 0', () => {
      const diamondData =
        {
          price: '169', 
          sub_price: '79',
          coin: '169', 
          dividend: '0' 
        };

      const settleResult = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 90);
      expect(settleResult).toHaveProperty('dividend_real', 0);
      expect(settleResult).toHaveProperty('coin', 90);
      expect(settleResult).toHaveProperty('dividend', 0);
    });

    it('金大神 169 79 0 169', () => {
      const diamondData =
        {
          price: '169', 
          sub_price: '79',
          coin: '0', 
          dividend: '169' 
        };

      const settleResult = = settleRefundCoinDividend(diamondData.price, diamondData.sub_price,
        diamondData.coin, diamondData.dividend);

      expect(settleResult).toHaveProperty('coin_real', 0);
      expect(settleResult).toHaveProperty('dividend_real', 90);
      expect(settleResult).toHaveProperty('coin', 0);
      expect(settleResult).toHaveProperty('dividend', 90);
    });
  });

});
