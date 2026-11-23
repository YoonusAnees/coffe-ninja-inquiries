import { db } from "./db.mjs";
import { users } from "./schema/schema.users.mjs";
import { employee } from "./schema/schema.employees.mjs";
import { hashPassword } from "../../utils/password.mjs";

const employeesToSeed = [
    {
        fullName: "Daniel Silva",
        email: "daniel@coffeeninja.com",
        password: "Password@123",
    },
    {
        fullName: "Sara Perera",
        email: "sara@coffeeninja.com",
        password: "Password@123",
    },
    {
        fullName: "Kasun Fernando",
        email: "kasun@coffeeninja.com",
        password: "Password@123",
    },
];

async function seedEmployees() {
    console.log("Seeding employees...");

    for (const emp of employeesToSeed) {

        const normalizedEmail = emp.email.trim().toLowerCase();
        const passwordHash = await hashPassword(emp.password);

        await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    email: normalizedEmail,
                    passwordHash,
                    role: "EMPLOYEE",
                    isActive: true,
                })
                .onConflictDoNothing({ target: users.email })
                .returning({ id: users.id, email: users.email });

            if (!createdUser) {
                console.log(`Skipped (already exists): ${normalizedEmail}`);
                return;
            }

            await tx.insert(employee).values({
                userId: createdUser.id,
                fullName: emp.fullName.trim(),
            });

            console.log(`Created employee: ${emp.fullName} (${createdUser.email})`);
        });
    }

    console.log("Employee seeding complete.");
    process.exit(0);
}

seedEmployees().catch((err) => {
    console.error("Failed to seed employees:", err);
    process.exit(1);
});