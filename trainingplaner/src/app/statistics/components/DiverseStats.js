import React, { useEffect, useState } from "react";
import styles from "../../styles/Statistics.module.css";

export default function DiverseStats() {
  const [data, setData] = useState();

  const serverUrl = "http://192.168.178.112:8080";

  async function getStatistics() {
    const response = await fetch(`${serverUrl}/api/statistic/diverseStats`);
    const data = await response.json();

    console.log(data);
    setData(data);
  }

  useEffect(() => {
    getStatistics();
  }, []);

  return (
    <div className={styles.chart}>
      {data ? (
        <div>
          <table className={styles.table_component}>
            {/* <thead>
              <th>Stat</th>
              <th>Value</th>
            </thead> */}
            <tbody>
              <tr>
                <td>Number of Krafttrainings</td>
                <td>{data.krafttrainings}</td>
              </tr>
              <tr>
                <td>Number of Swimtrainings</td>
                <td>{data.swimtrainings}</td>
              </tr>
              <tr>
                <td>Number of Competitions</td>
                <td>{data.competitions}</td>
              </tr>
              <tr>
                <td>Total meters swum</td>
                <td>{data.totalvolume}m</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
