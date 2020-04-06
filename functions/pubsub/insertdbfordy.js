const modules = require('../util/modules');

async function inserttest() {
  const sport = 'basketball';
  const league = 'NBA';
  const betsID = '20200312';

  let ref = modules.database.ref(
    `${sport}/${league}/${betsID}/Summary/periods1/event0/clock`
  );
  await ref.set('11:20');

  //   let ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/Now_periods`
  //   );
  //   await ref.set(1);
  //   ref = modules.database.ref(`${sport}/${league}/${betsID}/Summary/Now_clock`);
  //   await ref.set('10:50');

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/scores`
  //   );
  //   await ref.set(29);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/two_points_att`
  //   );
  //   await ref.set(86);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/two_points_made`
  //   );
  //   await ref.set(71);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/two_points_att`
  //   );
  //   await ref.set(80);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/two_points_made`
  //   );
  //   await ref.set(45);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/three_points_att`
  //   );
  //   await ref.set(33);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/three_points_made`
  //   );
  //   await ref.set(18);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/three_points_att`
  //   );
  //   await ref.set(22);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/three_points_made`
  //   );
  //   await ref.set(11);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/free_throws_att`
  //   );
  //   await ref.set(8);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/free_throws_made`
  //   );
  //   await ref.set(7);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/free_throws_att`
  //   );
  //   await ref.set(12);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/free_throws_made`
  //   );
  //   await ref.set(7);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/rebounds`
  //   );
  //   await ref.set(44);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/rebounds`
  //   );
  //   await ref.set(32);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/assists`
  //   );
  //   await ref.set(20);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/assists`
  //   );
  //   await ref.set(12);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/blocks`
  //   );
  //   await ref.set(7);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/blocks`
  //   );
  //   await ref.set(3);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/steals`
  //   );
  //   await ref.set(8);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/steals`
  //   );
  //   await ref.set(11);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/turnovers`
  //   );
  //   await ref.set(7);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/turnovers`
  //   );
  //   await ref.set(2);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/personal_fouls`
  //   );
  //   await ref.set(18);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/personal_fouls`
  //   );
  //   await ref.set(17);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/Total/points_in_paint`
  //   );
  //   await ref.set(36);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/points_in_paint`
  //   );
  //   await ref.set(29);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/Total/scores`
  //   );
  //   await ref.set(20);
  //   ref = modules.database.ref(`${sport}/${league}/${betsID}/Summary/status`);
  //   await ref.set('inprogress');

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/periods0/points`
  //   );
  //   await ref.set(22);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/home/periods1/points`
  //   );
  //   await ref.set(7);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/periods0/points`
  //   );
  //   await ref.set(18);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/away/periods1/points`
  //   );
  //   await ref.set(2);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event0/description`
  //   );
  //   await ref.set(`Trevor Ariza misses three point jump shot`);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event0/description_ch`
  //   );
  //   await ref.set(`特雷沃阿裏紮三分不中`);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event1/description`
  //   );
  //   await ref.set(
  //     `Sekou Doumbouya makes two point jump shot (Svi Mykhailiuk assists)`
  //   );
  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event1/description_ch`
  //   );
  //   await ref.set(`杜姆布亞，塞古兩分球進`);

  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event2/description`
  //   );
  //   await ref.set(
  //     `Tony Snell makes three point jump shot (Svi Mykhailiuk assists)`
  //   );
  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods0/event2/description_ch`
  //   );
  //   await ref.set(`托尼斯內爾三分球進`);
  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods1/event0/description`
  //   );
  //   await ref.set(`Pistons defensive rebound`);
  //   ref = modules.database.ref(
  //     `${sport}/${league}/${betsID}/Summary/periods1/event0/description_ch`
  //   );
  //   await ref.set(`底特律活塞籃板球`);

  console.log('ok');
}
inserttest();
