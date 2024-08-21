"use client";
import React from "react";
import styles from "../styles/Statistics.module.css";
import VolumeChart from "./components/VolumeChart";

function Statistics() {
  return (
    <div className={styles.statisticsContainer}>
      <div className={styles.chartContainer}>
        <VolumeChart />
      </div>
      <div className={styles.chartContainer}>
        <VolumeChart />
      </div>
      <div className={styles.chartContainer}>
        <VolumeChart />
      </div>
      <div className={styles.chartContainer}>
        <VolumeChart />
      </div>
    </div>
  );
}

export default Statistics;
