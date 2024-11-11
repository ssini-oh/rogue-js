import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor() {
    this.hp = 100;
    this.attackPower = 10;
  }

  attack() {
    return this.attackPower;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100;
    this.attackPower = 5;
  }

  attack() {
    return this.attackPower;
  }
}

//---- 현재 상태 정보 출력
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(`| Player: HP ${player.hp}, Attack: ${player.attackPower} `) +
      chalk.redBright(`| Monster HP ${monster.hp}, Attack: ${monster.attackPower} |`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

//---- 전투 진행 함수
const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    // 전투 로그 출력
    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 공격한다 2. 도망친다`));
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    switch (choice) {
      //---- 공격한다 선택 시
      case '1':
        // 플레이어 공격
        const playerAttack = player.attack();
        monster.hp -= playerAttack;
        logs.push(chalk.green(`당신은 몬스터에게 [ ${playerAttack} ]의 피해를 입혔습니다.`));

        // 플레이어 공격 로그 출력 후 1초 대기
        console.clear();
        displayStatus(stage, player, monster);
        logs.forEach((log) => console.log(log));
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 몬스터 반격
        if (monster.hp > 0) {
          const monsterAttack = monster.attack();
          player.hp -= monsterAttack;

          // 몬스터 반격 로그 추가
          logs.push(
            chalk.redBright(`몬스터가 당신에게 [ ${monsterAttack} ]의 피해를 입혔습니다.\n`),
          );
        } else {
          logs.push(chalk.green(`✨몬스터를 물리쳤습니다!✨`));

          console.clear();
          displayStatus(stage, player, monster);
          logs.forEach((log) => console.log(log));

          console.log(chalk.green(`\n1. 다음 스테이지로 이동 2. 게임 종료`));
          const clearChoice = readlineSync.question('당신의 선택은? ');

          if (clearChoice === '1') {
            return; // 다음 스테이지로 이동
          } else if (clearChoice === '2') {
            process.exit();
          }
        }
        break;

      //---- 도망친다 선택 시
      case '2':
        break;

      default: // 유효하지 않은 입력
        logs.push(chalk.red('선택지에 있는 숫자를 입력해주세요.'));
        break;
    }
  }
};

//---- 게임 시작 함수
export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    stage++;
    player.hp = 100;
  }
}
