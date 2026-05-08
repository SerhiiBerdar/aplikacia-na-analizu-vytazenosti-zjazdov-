import { useState, useMemo } from "react";
          </ResponsiveContainer>
        </div>

        <div className="tableCard">
          <h3>Data Preview</h3>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  {filteredData[0] &&
                    Object.keys(filteredData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {filteredData.slice(0, 50).map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((value, i) => (
                      <td key={i}>{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
