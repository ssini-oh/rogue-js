import chalk from 'chalk';
import readlineSync from 'readline-sync';

//---- 플레이어 클래스 정의
class Player {
  static INITIAL_HP = 100;
  static INITIAL_POWER = 15;

  static increasedStat(stat) {
    // 10~30% 사이의 증가율
    const increaseRate = 0.1 + Math.random() * 0.2;
    return Math.floor(stat * (1 + increaseRate));
  }

  constructor(stage) {
    if (stage === 1) {
      this.hp = Player.INITIAL_HP;
      this.maxHp = Player.INITIAL_HP;
      this.attackPower = Player.INITIAL_POWER;
    } else {
      this.hp = Player.increasedStat(Player.INITIAL_HP * Math.pow(1.1, stage - 1));
      this.maxHp = this.hp;
      this.attackPower = Player.increasedStat(Player.INITIAL_POWER * Math.pow(1.1, stage - 1));
    }
  }

  // 스탯 증가 메서드
  increaseStats() {
    const newHP = Player.increasedStat(this.maxHp);
    this.hp = newHP;
    this.maxHp = newHP;

    this.attackPower = Player.increasedStat(this.attackPower);
  }

  attack() {
    return this.attackPower;
  }
}

//---- 몬스터 클래스 정의
class Monster {
  static INITIAL_HP = 100;
  static INITIAL_POWER = 12;

  static increasedStat(stat) {
    // 10~50% 사이의 증가율
    const increaseRate = 0.1 + Math.random() * 0.4;
    return Math.floor(stat * (1 + increaseRate));
  }

  constructor(stage) {
    if (stage === 1) {
      // 기본 스탯
      this.hp = Monster.INITIAL_HP;
      this.maxHp = Monster.INITIAL_HP;
      this.attackPower = Monster.INITIAL_POWER;
    } else {
      this.hp = Monster.increasedStat(Monster.INITIAL_HP * Math.pow(1.1, stage - 1));
      this.maxHp = this.hp;
      this.attackPower = Monster.increasedStat(Monster.INITIAL_POWER * Math.pow(1.5, stage - 1));
    }
  }

  attack() {
    return this.attackPower;
  }
}

//---- 스테이지 클래스 정의
class Stage {
  constructor() {
    this.start = 1;
    this.end = 10;
  }

  nextStage() {
    return this.start++;
  }
}

//---- 현재 상태 정보 출력
function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage.start} `) +
      chalk.blueBright(
        `| Player: HP ${player.hp}/${player.maxHp}, Attack: ${player.attackPower} `,
      ) +
      chalk.redBright(
        `| Monster HP ${monster.hp}/${monster.maxHp}, Attack: ${monster.attackPower} |`,
      ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

//---- 전투 로그 출력 함수
function displayBattleLogs(logs) {
  logs.forEach((log) => console.log(log));
}

//---- 전투 선택지 출력 및 사용자 입력 처리 함수
function displayBattleOptions(comboSuccessRate, defenseSuccessRate, runSuccessRate) {
  console.log(
    chalk.green(
      `\n1. 공격한다  2. 연속공격(${comboSuccessRate}%)  3. 방어한다(${defenseSuccessRate}%)  4. 도망친다(${runSuccessRate}%)`,
    ),
  );
  return readlineSync.question('당신의 선택은? ');
}

//---- 몬스터 반격 및 반격 로그 출력 함수
async function monsterAttackAndLog(player, monster, logs) {
  const monsterAttack = monster.attack();
  player.hp = Math.max(0, player.hp - monsterAttack);

  logs.push(chalk.redBright(`...몬스터가 당신에게 [ ${monsterAttack} ]의 피해를 입혔습니다.\n`));
}

//---- 스테이지 이동 확인 함수
function promptNextStageOrEnd() {
  console.log(chalk.blue(`\n1. 다음 스테이지로 이동 2. 게임 종료`));
  return readlineSync.question('당신의 선택은? ');
}

//---- 플레이어 사망 확인 함수
function checkPlayerDeath(player, stage, monster, logs) {
  if (player.hp <= 0) {
    console.clear();
    displayStatus(stage, player, monster);
    displayBattleLogs(logs);

    console.log(chalk.bgRed('...당신은 전사하였습니다.'));
    return true;
  }
  return false;
}

//---- 전투 진행 함수
const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    let comboSuccessRate = Math.floor(Math.random() * 40) + 10;
    let defenseSuccessRate = Math.floor(Math.random() * 40) + 10;
    let runSuccessRate = Math.floor(Math.random() * 10) + 1;
    const successRate = Math.random() * 100;

    console.clear();
    displayStatus(stage, player, monster);

    // 전투 로그 출력
    displayBattleLogs(logs);

    // 유저 선택지 출력
    const choice = displayBattleOptions(comboSuccessRate, defenseSuccessRate, runSuccessRate);

    // 플레이어의 선택에 따라 다음 행동 처리
    switch (choice) {
      //---- 공격한다 선택 시
      case '1':
        // 플레이어 공격
        const playerAttack = player.attack();
        monster.hp = Math.max(0, monster.hp - playerAttack);
        logs.push(chalk.green(`당신은 몬스터에게 [ ${playerAttack} ]의 피해를 입혔습니다.`));

        console.clear();
        displayStatus(stage, player, monster);
        displayBattleLogs(logs);

        // 몬스터 반격
        if (monster.hp > 0) {
          await monsterAttackAndLog(player, monster, logs, stage);
        } else {
          logs.push(chalk.green(`✨몬스터를 물리쳤습니다!✨`));
          console.clear();
          displayStatus(stage, player, monster);
          displayBattleLogs(logs);

          // 스테이지 클리어 여부에 따른 선택지 출력 (다음 스테이지로 이동 or 게임 종료)
          if (stage.start >= stage.end) {
            console.log(chalk.bgGreenBright('\n축하합니다! 게임을 클리어하셨습니다!'));
            return;
          } else {
            const clearChoice = promptNextStageOrEnd();

            if (clearChoice === '1')
              return; // 다음 스테이지로 이동
            else if (clearChoice === '2')
              process.exit(); // 게임 종료
            else logs.push(chalk.red('선택지에 있는 숫자를 입력해주세요.'));
          }
        }

        // 플레이어 사망 체크
        if (checkPlayerDeath(player, stage, monster, logs)) return;
        break;

      //---- 연속공격 선택 시
      case '2':
        if (successRate < comboSuccessRate) {
          const comboAttack = player.attack() * 2; // 2배 공격력

          // 플레이어 hp 확률적 소모
          const hpCostRate = 0.01 + Math.random() * 0.09; // 1~10% 사이 소모
          const hpCost = Math.floor(player.hp * hpCostRate);

          player.hp = Math.max(0, player.hp - hpCost);
          monster.hp = Math.max(0, monster.hp - comboAttack);

          logs.push(
            chalk.green(`연속 공격 성공! 몬스터에게 [ ${comboAttack} ]의 피해를 입혔습니다!`),
          );
          logs.push(chalk.red(`연속 공격으로 인해 체력이 [ ${hpCost} ] 소모되었습니다.\n`));
        } else {
          logs.push(chalk.red(`\n연속 공격 실패! 몬스터가 반격합니다.`));
          await monsterAttackAndLog(player, monster, logs, stage);
        }

        // 몬스터 사망 체크
        if (monster.hp <= 0) {
          logs.push(chalk.green(`✨몬스터를 물리쳤습니다!✨`));
          console.clear();
          displayStatus(stage, player, monster);
          displayBattleLogs(logs);

          // 스테이지 클리어 여부에 따른 선택지 출력 (다음 스테이지로 이동 or 게임 종료)
          if (stage.start >= stage.end) {
            console.log(chalk.bgGreenBright('\n축하합니다! 게임을 클리어하셨습니다!'));
            return;
          } else {
            const clearChoice = promptNextStageOrEnd();

            if (clearChoice === '1')
              return; // 다음 스테이지로 이동
            else if (clearChoice === '2')
              process.exit(); // 게임 종료
            else logs.push(chalk.red('선택지에 있는 숫자를 입력해주세요.'));
          }
        }

        // 플레이어 사망 체크
        if (checkPlayerDeath(player, stage, monster, logs)) return;
        break;

      //---- 방어한다 선택 시
      case '3':
        if (successRate < defenseSuccessRate) {
          logs.push(chalk.blue(`\n방어에 성공했습니다! 몬스터의 공격을 막아냈습니다.`));

          // 패링 발생 (20% 확률)
          const parryRate = Math.random() * 100;
          if (parryRate < 20) {
            // 몬스터 공격력의 50% 반사
            const parryDamage = Math.floor(monster.attack() * 0.5);
            monster.hp = Math.max(0, monster.hp - parryDamage);
            logs.push(
              chalk.green(`패링 성공! 몬스터에게 [ ${parryDamage} ]의 피해를 반사했습니다!\n`),
            );
          }
        } else {
          logs.push(chalk.red(`\n방어에 실패했습니다! 몬스터의 반격을 그대로 받습니다.`));
          await monsterAttackAndLog(player, monster, logs, stage);
        }

        // 몬스터 사망 체크
        if (monster.hp <= 0) {
          logs.push(chalk.green(`✨몬스터를 물리쳤습니다!✨`));
          console.clear();
          displayStatus(stage, player, monster);
          displayBattleLogs(logs);

          // 스테이지 클리어 여부에 따른 선택지 출력 (다음 스테이지로 이동 or 게임 종료)
          if (stage.start >= stage.end) {
            console.log(chalk.bgGreenBright('\n축하합니다! 게임을 클리어하셨습니다!'));
            return;
          } else {
            const clearChoice = promptNextStageOrEnd();

            if (clearChoice === '1')
              return; // 다음 스테이지로 이동
            else if (clearChoice === '2')
              process.exit(); // 게임 종료
            else logs.push(chalk.red('선택지에 있는 숫자를 입력해주세요.'));
          }
        }

        // 플레이어 사망 체크
        if (checkPlayerDeath(player, stage, monster, logs)) return;
        break;

      //---- 도망친다 선택 시
      case '4':
        if (successRate < runSuccessRate) {
          logs.push(chalk.yellow(`도망에 성공했습니다! 몬스터의 공격을 피해 탈출했습니다.`));

          console.clear();
          displayStatus(stage, player, monster);
          displayBattleLogs(logs);

          // 도망 성공 따른 선택지 출력 (다음 스테이지로 이동 or 게임 종료)
          if (stage.start >= stage.end) {
            console.log(chalk.bgGreenBright('\n축하합니다! 게임을 클리어하셨습니다!'));
            return;
          } else {
            const clearChoice = promptNextStageOrEnd();

            if (clearChoice === '1')
              return; // 다음 스테이지로 이동
            else if (clearChoice === '2')
              process.exit(); // 게임 종료
            else logs.push(chalk.red('선택지에 있는 숫자를 입력해주세요.'));
          }
        } else {
          logs.push(chalk.red(`\n붙잡혔습니다! 몬스터가 공격합니다.`));
          await monsterAttackAndLog(player, monster, logs, stage);
        }

        // 플레이어 사망 체크
        if (checkPlayerDeath(player, stage, monster, logs)) return;
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
  const stage = new Stage();
  const player = new Player(stage.start);

  while (stage.start <= stage.end) {
    const monster = new Monster(stage.start);
    await battle(stage, player, monster);

    if (player.hp > 0) {
      player.increaseStats(); // 스탯 증가
      stage.nextStage();
    } else if (player.hp <= 0) {
      console.log(chalk.white('게임을 종료합니다.'));
      return;
    }
  }
}
