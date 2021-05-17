export enum AR_Events {
    ENEMY_ENTERED_LEVEL_END = "EnemyEnteredLevelEnd",
    TOWER_ENTERED_ENEMY_PATH = "TowerEnteredEnemyPath",
    TOWER_EXITED_ENEMY_PATH = "TowerExitedEnemyPath",
    ENEMY_ENTERED_TOWER_RANGE = "EnemyEnteredTowerRange",
    ENEMY_HIT = "EnemyHit",
    ENEMY_DIED = "EnemyDied",
    ENEMY_CONFUSED = "EnemyConfused",
    PAUSE_RESUME_GAME = "PauseResumeGame",
    LEVEL_SPEED_CHANGE = "LevelSpeedChange",
    ENEMY_SLOWED = "EnemySlowed",
    WAVE_START_END = "WaveStartEnd",
    NEW_TARGET_LOCATION = "NewTargetLocation",
    ENEMY_ARMOR_SHRED = "EnemyArmorShred"
}