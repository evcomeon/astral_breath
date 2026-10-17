/**
 * Stardust Breath Garden (星尘溯息庭)
 * Full Game Shell & State Machine conforming to PRD v1.2
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveModal,
  AreaId,
  CharacterId,
  FrozenSettlementSnapshot,
  GameSaveState,
  GameState,
  ItemId,
  RecipeDef,
} from './types/game';
import { loadGameSave, saveGame, generateInitialSave, recomputeDerivedProgress } from './engine/save';
import { createSettlementSnapshot } from './engine/offline';
import {
  mergeSlots,
  moveOrSwapSlot,
  craftRecipe,
  executeBatchMerge,
  getAvailableBoardSlots,
  sortBoardHighToLow,
  countMergeablePairs,
  addItemToBoard,
} from './engine/board';
import { sound } from './engine/audio';
import { GardenCanvas } from './components/GardenCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HeaderStatus } from './components/HeaderStatus';
import { BoardView } from './components/BoardView';
import { InterstellarVoyageView } from './components/InterstellarVoyageView';
import { BottomNavBar, MainNavTab } from './components/BottomNavBar';
import { OfflineSettlementModal } from './components/OfflineSettlementModal';
import { CondenseDustModal } from './components/CondenseDustModal';
import { CharactersModal } from './components/CharactersModal';
import { CompendiumModal } from './components/CompendiumModal';
import { GardenAreasModal } from './components/GardenAreasModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { TimeTravelDrawer } from './components/TimeTravelDrawer';
import { SettingsModal } from './components/SettingsModal';
import { BuyShardModal } from './components/BuyShardModal';
import { VictoryModal } from './components/VictoryModal';
import { SynthesisPathModal } from './components/SynthesisPathModal';
import { getTranslation } from './i18n/translations';
import { AREAS } from './data/areas';
import { CHARACTERS } from './data/characters';
import { ITEMS } from './data/items';
import { FastForward, Bell } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentTab, setCurrentTab] = useState<MainNavTab>('VOYAGE');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [save, setSave] = useState<GameSaveState>(() => loadGameSave());
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTimeTravel, setShowTimeTravel] = useState(false);
  const [pathModalItemId, setPathModalItemId] = useState<ItemId | null>(null);

  // Sync sound settings with audio engine
  useEffect(() => {
    sound.setEnabled(save.settings.soundEnabled);
    sound.setVolume(save.settings.soundVolume);
  }, [save.settings.soundEnabled, save.settings.soundVolume]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Check and process milestones on save changes
  const checkMilestones = useCallback((currentState: GameSaveState): GameSaveState => {
    const updated = { ...currentState };
    const discovered = updated.discoveredItemIds;
    const claimed = [...updated.claimedMilestones];
    let changed = false;

    // Milestone 1: MERGE_DUST_3 -> 2 Glimmer Shards + Nori
    if (discovered.includes('MERGE_DUST_3') && !claimed.includes('M_DUST_3')) {
      claimed.push('M_DUST_3');
      updated.materials.glimmer = Math.min(999, updated.materials.glimmer + 2);
      if (!updated.discoveredCharacterIds.includes('CHR_NORI')) {
        updated.discoveredCharacterIds.push('CHR_NORI');
      }
      changed = true;
    }

    // Milestone 2: MERGE_DUST_4 -> 1 Crystal
    if (discovered.includes('MERGE_DUST_4') && !claimed.includes('M_DUST_4')) {
      claimed.push('M_DUST_4');
      updated.materials.crystal = Math.min(999, updated.materials.crystal + 1);
      changed = true;
    }

    // Milestone 3: MERGE_DUST_6 -> 1 Crystal
    if (discovered.includes('MERGE_DUST_6') && !claimed.includes('M_DUST_6')) {
      claimed.push('M_DUST_6');
      updated.materials.crystal = Math.min(999, updated.materials.crystal + 1);
      changed = true;
    }

    // Milestone 4: MERGE_DUST_8 -> 1 Crystal
    if (discovered.includes('MERGE_DUST_8') && !claimed.includes('M_DUST_8')) {
      claimed.push('M_DUST_8');
      updated.materials.crystal = Math.min(999, updated.materials.crystal + 1);
      changed = true;
    }

    // Milestone 5: OBJ_RESONANCE_ARRAY -> Vela
    if (discovered.includes('OBJ_RESONANCE_ARRAY') && !claimed.includes('M_ARRAY')) {
      claimed.push('M_ARRAY');
      if (!updated.discoveredCharacterIds.includes('CHR_VELA')) {
        updated.discoveredCharacterIds.push('CHR_VELA');
      }
      changed = true;
    }

    // Milestone 6: AREA_03 Repaired -> Orin
    if (updated.repairedAreaIds.includes('AREA_03') && !claimed.includes('M_AREA_3')) {
      claimed.push('M_AREA_3');
      if (!updated.discoveredCharacterIds.includes('CHR_ORIN')) {
        updated.discoveredCharacterIds.push('CHR_ORIN');
      }
      changed = true;
    }

    if (changed) {
      updated.claimedMilestones = claimed;
    }
    return updated;
  }, []);

  // Update save helper with auto-milestones & persist
  const updateSave = useCallback((updater: (prev: GameSaveState) => GameSaveState) => {
    setSave((prev) => {
      const next = updater(prev);
      const withMilestones = checkMilestones(next);
      saveGame(withMilestones);
      return withMilestones;
    });
  }, [checkMilestones]);

  // Handle Start / Enter Garden
  const handleStartGame = () => {
    setGameState('PLAYING');
    // Check if offline time has accrued since lastClaimUtcMs
    const now = Date.now();
    const snapshot = createSettlementSnapshot(save, now);
    if (snapshot && snapshot.elapsedSeconds >= 3) {
      updateSave((s) => ({ ...s, frozenSettlementSnapshot: snapshot }));
      setActiveModal('SETTLEMENT');
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      if (e.key === 'Escape') {
        if (pathModalItemId) {
          setPathModalItemId(null);
        } else if (activeModal) {
          setActiveModal(null);
        } else if (showTimeTravel) {
          setShowTimeTravel(false);
        } else {
          setActiveModal('SETTINGS');
        }
      } else if (e.code === 'Space' && !activeModal && !showTimeTravel && !pathModalItemId) {
        e.preventDefault();
        sound.playClick();
        setActiveModal('CONDENSE');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, activeModal, showTimeTravel, pathModalItemId]);

  // Periodic Auto-save & Breath ticking
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState === 'PLAYING') {
        updateSave((s) => ({ ...s, lastSeenUtcMs: Date.now() }));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [gameState, updateSave]);

  // Board Interactions: Click & Pair Merge
  const handleSlotClick = (index: number) => {
    const clickedSlot = save.board[index];

    if (selectedSlotIndex === null) {
      if (clickedSlot.itemId) {
        setSelectedSlotIndex(index);
        sound.playClick();
      }
    } else {
      if (selectedSlotIndex === index) {
        // Deselect
        setSelectedSlotIndex(null);
      } else {
        const sourceSlot = save.board[selectedSlotIndex];
        if (sourceSlot.itemId === clickedSlot.itemId && clickedSlot.itemId) {
          // Merge identical pair
          const res = mergeSlots(save, selectedSlotIndex, index);
          if (res.success) {
            sound.playMerge(res.xpEarned > 16 ? 5 : 2);
            updateSave((s) => {
              const finalBoard = s.settings.autoSortBoard !== false
                ? sortBoardHighToLow(res.newBoard)
                : res.newBoard;
              const updated = {
                ...s,
                board: finalBoard,
                formationXp: s.formationXp + res.xpEarned,
                companionXp: Math.min(200, s.companionXp + res.companionXpEarned),
              };
              for (const newItemId of res.newDiscoveredItems) {
                if (!updated.discoveredItemIds.includes(newItemId)) {
                  updated.discoveredItemIds.push(newItemId);
                }
              }
              return recomputeDerivedProgress(updated);
            });
            showToast(`+${res.xpEarned} XP! 合成成功`);
          }
        } else {
          // Move or swap
          sound.playClick();
          const newBoard = moveOrSwapSlot(save.board, selectedSlotIndex, index);
          updateSave((s) => ({ ...s, board: newBoard }));
        }
        setSelectedSlotIndex(null);
      }
    }
  };

  // Drag & Drop
  const handleSlotDrop = (fromIndex: number, toIndex: number) => {
    const sourceSlot = save.board[fromIndex];
    const targetSlot = save.board[toIndex];

    if (!sourceSlot.itemId) return;

    if (targetSlot.itemId === sourceSlot.itemId) {
      // Merge
      const res = mergeSlots(save, fromIndex, toIndex);
      if (res.success) {
        sound.playMerge(res.xpEarned > 16 ? 5 : 2);
        updateSave((s) => {
          const finalBoard = s.settings.autoSortBoard !== false
            ? sortBoardHighToLow(res.newBoard)
            : res.newBoard;
          const updated = {
            ...s,
            board: finalBoard,
            formationXp: s.formationXp + res.xpEarned,
            companionXp: Math.min(200, s.companionXp + res.companionXpEarned),
          };
          for (const newItemId of res.newDiscoveredItems) {
            if (!updated.discoveredItemIds.includes(newItemId)) {
              updated.discoveredItemIds.push(newItemId);
            }
          }
          return recomputeDerivedProgress(updated);
        });
        showToast(`+${res.xpEarned} XP! 合成成功`);
      }
    } else {
      // Move or swap
      sound.playClick();
      const newBoard = moveOrSwapSlot(save.board, fromIndex, toIndex);
      updateSave((s) => ({ ...s, board: newBoard }));
    }
    setSelectedSlotIndex(null);
  };

  // Offline Claim Settlement
  const handleClaimSettlement = () => {
    const snapshot = save.frozenSettlementSnapshot;
    if (!snapshot) return;

    const rewardDustBigInt = BigInt(snapshot.computedReward);
    const newDust = (BigInt(save.dust || '0') + rewardDustBigInt).toString();
    const now = Date.now();

    updateSave((s) => {
      const updated = {
        ...s,
        dust: newDust,
        lastClaimUtcMs: now,
        lastSeenUtcMs: now,
        frozenSettlementSnapshot: null,
      };
      if (snapshot.ashAwarded) {
        updated.materials.ash = Math.min(999, updated.materials.ash + 1);
        updated.lastAshClaimUtcMs = now;
      }
      return updated;
    });

    setActiveModal(null);
    showToast(`成功收取 ${snapshot.computedReward.toLocaleString()} 星尘！`);
  };

  // Condense Dust (10 dust -> MERGE_DUST_1)
  const handleCondense = (amount: number) => {
    const cost = BigInt(amount * 10);
    const currentDust = BigInt(save.dust || '0');
    if (currentDust < cost) {
      sound.playShatter();
      showToast(getTranslation(save.settings.language, 'insufficientDust'));
      return;
    }

    const addRes = addItemToBoard(save.board, 'MERGE_DUST_1', amount);
    if (!addRes.success && addRes.addedCount === 0) {
      sound.playShatter();
      showToast(getTranslation(save.settings.language, 'boardFull'));
      return;
    }

    sound.playCollect();
    const actualAdded = addRes.addedCount;
    const actualCost = BigInt(actualAdded * 10);

    updateSave((s) => {
      const finalBoard = s.settings.autoSortBoard !== false
        ? sortBoardHighToLow(addRes.newBoard)
        : addRes.newBoard;
      const updated = {
        ...s,
        dust: (BigInt(s.dust || '0') - actualCost).toString(),
        board: finalBoard,
      };
      if (!updated.discoveredItemIds.includes('MERGE_DUST_1')) {
        updated.discoveredItemIds.push('MERGE_DUST_1');
      }
      return updated;
    });

    setActiveModal(null);
    showToast(getTranslation(save.settings.language, 'condenseSuccess', { count: actualAdded }));
  };

  // Buy Glimmer Shards (1000 dust each)
  const handleBuyGlimmerShards = (count: number) => {
    const cost = BigInt(count * 1000);
    const currentDust = BigInt(save.dust || '0');
    if (currentDust < cost) return;

    updateSave((s) => ({
      ...s,
      dust: (BigInt(s.dust || '0') - cost).toString(),
      materials: {
        ...s.materials,
        glimmer: Math.min(999, s.materials.glimmer + count),
      },
    }));

    setActiveModal(null);
    showToast(getTranslation(save.settings.language, 'buyShardSuccess', { count }));
  };

  // Craft from Compendium or SynthesisPathModal
  const handleCraftRecipe = (recipe: RecipeDef) => {
    const res = craftRecipe(save, recipe, save.settings.language);
    if (res.success && res.newSave) {
      sound.playCraft();
      updateSave((s) => {
        const finalBoard =
          s.settings.autoSortBoard !== false
            ? sortBoardHighToLow(res.newSave!.board)
            : res.newSave!.board;
        return {
          ...res.newSave!,
          board: finalBoard,
        };
      });
      showToast(res.message || '共鸣制作成功！');
      if (recipe.output.itemId === 'OBJ_STAR_RELIC') {
        setActiveModal('VICTORY');
      }
    } else {
      sound.playShatter();
      showToast(res.message || '共鸣制作失败：材料或空间不足');
    }
  };

  // Batch Merge / Quick Auto-Merge
  const handleBatchMerge = () => {
    const res = executeBatchMerge(save);
    if (res.success) {
      sound.playMerge(4);
      updateSave((s) => {
        const finalBoard = s.settings.autoSortBoard !== false
          ? sortBoardHighToLow(res.newSave.board)
          : res.newSave.board;
        return {
          ...res.newSave,
          board: finalBoard,
        };
      });
      showToast(
        getTranslation(save.settings.language, 'batchMergeSuccess', {
          count: res.mergedCount,
        })
      );
    } else {
      sound.playClick();
      showToast(getTranslation(save.settings.language, 'noMatchingPairs'));
    }
  };

  // Sort Board High to Low (星盘自动排序：默认等级由高到低)
  const handleSortBoard = () => {
    sound.playClick();
    const sorted = sortBoardHighToLow(save.board);
    updateSave((s) => ({ ...s, board: sorted }));
    setSelectedSlotIndex(null);
    showToast(getTranslation(save.settings.language, 'sortBoardSuccess'));
  };

  // Toggle Auto-Sort
  const handleToggleAutoSort = () => {
    const nextVal = save.settings.autoSortBoard === false ? true : false;
    sound.playClick();
    updateSave((s) => {
      const updated = {
        ...s,
        settings: {
          ...s.settings,
          autoSortBoard: nextVal,
        },
      };
      if (nextVal) {
        updated.board = sortBoardHighToLow(updated.board);
      }
      return updated;
    });
    showToast(
      nextVal
        ? getTranslation(save.settings.language, 'sortBoardSuccess')
        : (save.settings.language === 'zh-CN' ? '自动排序已关闭' : 'Auto-Sort disabled')
    );
  };

  // Equip Character
  const handleEquipCharacter = (id: CharacterId) => {
    sound.playCollect();
    const char = CHARACTERS[id];
    const charName = char ? getTranslation(save.settings.language, char.nameKey) : id;
    updateSave((s) => ({ ...s, equippedCharacterId: id }));
    showToast(
      save.settings.language === 'zh-CN'
        ? `同行星灵已切换为【${charName}】！离线加成已生效`
        : `Equipped companion ${charName}! Bonus active.`
    );
  };

  // Repair Garden Area
  const handleRepairArea = (areaId: AreaId) => {
    const area = AREAS[areaId];
    const cost = BigInt(area.requiredDust);
    const currentDust = BigInt(save.dust || '0');
    if (currentDust < cost) {
      sound.playShatter();
      showToast(
        save.settings.language === 'zh-CN'
          ? `星尘不足！修缮【${getTranslation(save.settings.language, area.nameKey)}】需要 ${area.requiredDust.toLocaleString()} 星尘 (当前可用: ${currentDust.toLocaleString()})`
          : `Insufficient stardust! Need ${area.requiredDust.toLocaleString()}`
      );
      return;
    }

    if (area.requiredItem && !save.discoveredItemIds.includes(area.requiredItem)) {
      sound.playShatter();
      const reqItem = ITEMS[area.requiredItem];
      const reqName = reqItem ? getTranslation(save.settings.language, reqItem.nameKey) : area.requiredItem;
      showToast(
        save.settings.language === 'zh-CN'
          ? `未满足前置条件：需要先领悟/持有造物【${reqName}】！`
          : `Prerequisite missing: Requires ${reqName}`
      );
      return;
    }

    updateSave((s) => {
      const updated = {
        ...s,
        dust: (BigInt(s.dust || '0') - cost).toString(),
      };
      if (!updated.repairedAreaIds.includes(areaId)) {
        updated.repairedAreaIds.push(areaId);
      }
      return updated;
    });

    sound.playAreaRepair();
    showToast(
      getTranslation(save.settings.language, 'repairSuccess', {
        name: getTranslation(save.settings.language, area.nameKey),
      })
    );
  };

  // Time Travel Warp (Chrono Simulation)
  const handleWarpTime = (seconds: number) => {
    const now = Date.now();
    // Simulate by shifting lastClaimUtcMs backward by seconds
    const simulatedStart = save.lastClaimUtcMs - seconds * 1000;
    const tempSave = { ...save, lastClaimUtcMs: simulatedStart };
    const snapshot = createSettlementSnapshot(tempSave, now);

    updateSave((s) => ({
      ...s,
      lastClaimUtcMs: simulatedStart,
      frozenSettlementSnapshot: snapshot,
    }));

    setShowTimeTravel(false);
    setActiveModal('SETTLEMENT');
  };

  // Simulate Clock Rollback (Safeguard AT-018)
  const handleSimulateRollback = () => {
    const now = Date.now();
    // Set lastSeenUtcMs to 6 minutes into the future
    updateSave((s) => ({ ...s, lastSeenUtcMs: now + 360000 }));
    setShowTimeTravel(false);
    showToast(getTranslation(save.settings.language, 'clockRollbackWarning'));
  };

  // Toggle Language
  const handleToggleLang = () => {
    sound.playClick();
    const nextLang = save.settings.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    updateSave((s) => ({
      ...s,
      settings: { ...s.settings, language: nextLang },
    }));
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const nextEnabled = !save.settings.soundEnabled;
    sound.setEnabled(nextEnabled);
    if (nextEnabled) sound.playClick();
    updateSave((s) => ({
      ...s,
      settings: { ...s.settings, soundEnabled: nextEnabled },
    }));
  };

  // Determine current active garden area for canvas backdrop
  const currentAreaId: AreaId = save.repairedAreaIds.includes('AREA_03')
    ? 'AREA_03'
    : save.repairedAreaIds.includes('AREA_02')
    ? 'AREA_02'
    : 'AREA_01';

  const canBatchMerge = save.discoveredItemIds.includes('OBJ_RESONANCE_ARRAY');
  const hasUnclaimedOffline = Boolean(save.frozenSettlementSnapshot);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080b14] text-slate-100 flex flex-col justify-between font-sans">
      {/* 60fps Ambient Celestial Canvas Backdrop */}
      <GardenCanvas
        currentAreaId={currentAreaId}
        repairedAreaCount={save.repairedAreaIds.length}
      />

      {/* Screen 1: Title Screen */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          lang={save.settings.language}
          onToggleLang={handleToggleLang}
          soundEnabled={save.settings.soundEnabled}
          onToggleSound={handleToggleSound}
          hasSaveData={BigInt(save.dust || '0') > 0n || save.formationXp > 0}
        />
      )}

      {/* Screen 2: Playing State */}
      {gameState === 'PLAYING' && (
        <div className="relative z-10 w-full h-full flex flex-col justify-between overflow-hidden">
          {/* Top Status Cluster Header */}
          <HeaderStatus
            save={save}
            lang={save.settings.language}
            onOpenModal={(modal) => {
              if (modal === 'CHARACTERS') {
                setCurrentTab('COMPANIONS');
              } else if (modal === 'COMPENDIUM') {
                setCurrentTab('COMPENDIUM');
              } else if (modal === 'AREAS') {
                setCurrentTab('GARDEN');
              } else if (modal === 'SETTINGS') {
                setCurrentTab('SETTINGS');
              } else {
                if (modal === 'SETTLEMENT') {
                  // If opening settlement without snapshot, create live one
                  if (!save.frozenSettlementSnapshot) {
                    const snap = createSettlementSnapshot(save, Date.now());
                    if (snap) {
                      updateSave((s) => ({ ...s, frozenSettlementSnapshot: snap }));
                    }
                  }
                }
                setActiveModal(modal);
              }
            }}
            onToggleSound={handleToggleSound}
            onToggleLang={handleToggleLang}
            onBatchMerge={handleBatchMerge}
            canBatchMerge={canBatchMerge}
            hasUnclaimedOffline={hasUnclaimedOffline}
            onViewItemPath={(id) => setPathModalItemId(id)}
          />

          {/* Tab Navigation Content Area */}
          <main className="flex-1 w-full overflow-y-auto relative flex flex-col">
            {/* View 1: Interstellar Voyage (星际旅行 / 首页默认视界) */}
            {currentTab === 'VOYAGE' && (
              <InterstellarVoyageView
                save={save}
                lang={save.settings.language}
                onNavigateToTab={(tab) => {
                  sound.playClick();
                  setCurrentTab(tab);
                }}
                onOpenCondense={() => setActiveModal('CONDENSE')}
                onOpenSettlement={() => {
                  if (!save.frozenSettlementSnapshot) {
                    const snap = createSettlementSnapshot(save, Date.now());
                    if (snap) {
                      updateSave((s) => ({ ...s, frozenSettlementSnapshot: snap }));
                    }
                  }
                  setActiveModal('SETTLEMENT');
                }}
                onViewItemPath={(id) => setPathModalItemId(id)}
                onQuickMerge={handleBatchMerge}
                mergeablePairsCount={countMergeablePairs(save.board)}
                currentAreaId={currentAreaId}
              />
            )}

            {/* View 2: Astrolabe 8x8 Board & Synthesis Matrix (溯息星盘) */}
            {currentTab === 'ASTROLABE' && (
              <div className="flex-1 w-full flex items-center justify-center p-2 overflow-y-auto animate-in fade-in duration-200">
                <BoardView
                  save={save}
                  lang={save.settings.language}
                  onSlotClick={handleSlotClick}
                  onSlotDrop={handleSlotDrop}
                  selectedSlotIndex={selectedSlotIndex}
                  onBuyGlimmerShard={() => setActiveModal('BUY_SHARD')}
                  onQuickMerge={handleBatchMerge}
                  onDeselect={() => setSelectedSlotIndex(null)}
                  onViewItemPath={(id) => setPathModalItemId(id)}
                  onSortBoard={handleSortBoard}
                  autoSortEnabled={save.settings.autoSortBoard !== false}
                  onToggleAutoSort={handleToggleAutoSort}
                  onCondense={handleCondense}
                />
              </div>
            )}

            {/* View 3: Compendium & Recipe Forge (造物图鉴) */}
            {currentTab === 'COMPENDIUM' && (
              <div className="flex-1 w-full p-2 sm:p-4 max-w-4xl mx-auto overflow-y-auto animate-in fade-in duration-200">
                <CompendiumModal
                  save={save}
                  lang={save.settings.language}
                  onClose={() => setCurrentTab('VOYAGE')}
                  onCraftRecipe={handleCraftRecipe}
                  onViewItemPath={(id) => setPathModalItemId(id)}
                  isInline={true}
                />
              </div>
            )}

            {/* View 4: Astral Companions (星灵伴旅) */}
            {currentTab === 'COMPANIONS' && (
              <div className="flex-1 w-full p-2 sm:p-4 max-w-3xl mx-auto overflow-y-auto animate-in fade-in duration-200">
                <CharactersModal
                  save={save}
                  lang={save.settings.language}
                  onEquipCharacter={handleEquipCharacter}
                  onClose={() => setCurrentTab('VOYAGE')}
                  isInline={true}
                />
              </div>
            )}

            {/* View 5: Garden Sanctum Realms (庭院界域) */}
            {currentTab === 'GARDEN' && (
              <div className="flex-1 w-full p-2 sm:p-4 max-w-3xl mx-auto overflow-y-auto animate-in fade-in duration-200">
                <GardenAreasModal
                  save={save}
                  lang={save.settings.language}
                  onRepairArea={handleRepairArea}
                  onClose={() => setCurrentTab('VOYAGE')}
                  onViewItemPath={(id) => setPathModalItemId(id)}
                  isInline={true}
                />
              </div>
            )}

            {/* View 6: Chrono Warp, Settings & Diagnostics (庭主密卷与时空设置) */}
            {currentTab === 'SETTINGS' && (
              <div className="flex-1 w-full p-2 sm:p-4 max-w-2xl mx-auto overflow-y-auto animate-in fade-in duration-200">
                <SettingsModal
                  save={save}
                  lang={save.settings.language}
                  onUpdateSettings={(newSettings) => updateSave((s) => ({ ...s, settings: newSettings }))}
                  onImportSave={(saveData) => {
                    try {
                      const parsed = JSON.parse(saveData);
                      const validated = recomputeDerivedProgress(parsed);
                      updateSave(() => validated);
                      showToast('存档导入成功！');
                    } catch {
                      showToast('导入失败：存档数据损坏');
                    }
                  }}
                  onResetSave={() => {
                    const initial = generateInitialSave(save.settings.language);
                    updateSave(() => initial);
                    showToast('已重置为初始新档');
                  }}
                  onClose={() => setCurrentTab('VOYAGE')}
                  isInline={true}
                  onOpenTimeTravel={() => setShowTimeTravel(true)}
                  onOpenTestRunner={() => setActiveModal('TESTS')}
                />
              </div>
            )}
          </main>

          {/* Bottom Persistent Navigation Bar (底部导航架构) */}
          <BottomNavBar
            currentTab={currentTab}
            onTabChange={(tab) => {
              sound.playClick();
              setCurrentTab(tab);
            }}
            lang={save.settings.language}
            mergeablePairsCount={countMergeablePairs(save.board)}
            hasUnclaimedOffline={hasUnclaimedOffline}
            discoveredCount={save.discoveredItemIds.length}
            totalItemsCount={Object.keys(ITEMS).length}
          />
        </div>
      )}

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-cyan-400/80 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] text-xs font-mono text-cyan-200 flex items-center space-x-2 animate-bounce">
          <Bell className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Popups */}
      {activeModal === 'SETTLEMENT' && save.frozenSettlementSnapshot && (
        <OfflineSettlementModal
          save={save}
          snapshot={save.frozenSettlementSnapshot}
          lang={save.settings.language}
          onClaim={handleClaimSettlement}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'CONDENSE' && (
        <CondenseDustModal
          save={save}
          lang={save.settings.language}
          onCondense={handleCondense}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'BUY_SHARD' && (
        <BuyShardModal
          save={save}
          lang={save.settings.language}
          onBuy={handleBuyGlimmerShards}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'CHARACTERS' && (
        <CharactersModal
          save={save}
          lang={save.settings.language}
          onEquipCharacter={handleEquipCharacter}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'COMPENDIUM' && (
        <CompendiumModal
          save={save}
          lang={save.settings.language}
          onCraftRecipe={handleCraftRecipe}
          onClose={() => setActiveModal(null)}
          onViewItemPath={(id) => setPathModalItemId(id)}
        />
      )}

      {activeModal === 'AREAS' && (
        <GardenAreasModal
          save={save}
          lang={save.settings.language}
          onRepairArea={handleRepairArea}
          onClose={() => setActiveModal(null)}
          onViewItemPath={(id) => setPathModalItemId(id)}
        />
      )}

      {activeModal === 'TESTS' && (
        <TestRunnerModal
          lang={save.settings.language}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'SETTINGS' && (
        <SettingsModal
          save={save}
          lang={save.settings.language}
          onUpdateSettings={(newSettings) => updateSave((s) => ({ ...s, settings: newSettings }))}
          onImportSave={(saveData) => {
            try {
              const parsed = JSON.parse(saveData);
              const validated = recomputeDerivedProgress(parsed);
              updateSave(() => validated);
              showToast('存档导入成功！');
              setActiveModal(null);
            } catch {
              showToast('导入失败：存档数据损坏');
            }
          }}
          onResetSave={() => {
            const initial = generateInitialSave(save.settings.language);
            updateSave(() => initial);
            setActiveModal(null);
            showToast('已重置为初始新档');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'VICTORY' && (
        <VictoryModal
          lang={save.settings.language}
          onClose={() => setActiveModal(null)}
        />
      )}

      {showTimeTravel && (
        <TimeTravelDrawer
          lang={save.settings.language}
          onWarpTime={handleWarpTime}
          onSimulateRollback={handleSimulateRollback}
          onClose={() => setShowTimeTravel(false)}
        />
      )}

      {/* Synthesis Pathway Modal */}
      {pathModalItemId && (
        <SynthesisPathModal
          itemId={pathModalItemId}
          save={save}
          lang={save.settings.language}
          onSelectItem={(newId) => setPathModalItemId(newId)}
          onClose={() => setPathModalItemId(null)}
          onCraftRecipe={handleCraftRecipe}
          onOpenCondense={() => {
            setPathModalItemId(null);
            setActiveModal('CONDENSE');
          }}
          onOpenBuyShard={() => {
            setPathModalItemId(null);
            setActiveModal('BUY_SHARD');
          }}
        />
      )}
    </div>
  );
}
