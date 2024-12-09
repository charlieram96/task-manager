/*
  Warnings:

  - Added the required column `fullName` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "overseers" TEXT NOT NULL
);
INSERT INTO "new_Department" ("id", "name", "fullName", "overseers") 
SELECT "id", "name", 
CASE 
    WHEN name = 'IT' THEN 'Information Technology'
    WHEN name = 'HR' THEN 'Human Resources'
    WHEN name = 'FIN' THEN 'Finance'
    WHEN name = 'OPS' THEN 'Operations'
    WHEN name = 'MKTG' THEN 'Marketing'
    WHEN name = 'SALES' THEN 'Sales'
    WHEN name = 'LEGAL' THEN 'Legal'
    WHEN name = 'RD' THEN 'Research and Development'
    WHEN name = 'CS' THEN 'Customer Service'
    WHEN name = 'ADMIN' THEN 'Administration'
    ELSE name 
END as "fullName",
"overseers" FROM "Department";
DROP TABLE "Department";
ALTER TABLE "new_Department" RENAME TO "Department";
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
