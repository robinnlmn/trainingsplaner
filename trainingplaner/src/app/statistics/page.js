"use client";
import React from "react";
import styles from "../styles/Statistics.module.css";
import VolumeChart from "./components/VolumeChart";
import IntensityChart from "./components/IntensityChart";
import VolumeIntensityChart from "./components/VolumeIntensityChart";
import DiverseStats from "./components/DiverseStats";

function Statistics() {
  return (
    <div className={styles.statisticsContainer}>
      <div className={styles.chartsContainer}>
        <div className={styles.chartWrapper}>
          <VolumeChart />
        </div>
        <div className={styles.chartWrapper}>
          <IntensityChart />
        </div>
        <div className={styles.chartWrapper}>
          <VolumeIntensityChart />
        </div>
        <div className={styles.chartWrapper}>
          <DiverseStats />
        </div>
      </div>
    </div>
  );
}

export default Statistics;
