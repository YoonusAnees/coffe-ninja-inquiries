import { db } from "./db.mjs";
import { users } from "./schema/schema.users.mjs";
import { customer } from "./schema/schema.customers.mjs";
import { hashPassword } from "../../utils/password.mjs";

const customersToSeed = [
    {
        fullName: "Nimal Jayawardena",
        email: "nimal@example.com",
        phone: "+94771234567",
        password: "CustomerPass@123",
    },
    {
        fullName: "Ayesha Fernando",
        email: "ayesha@example.com",
        phone: "+94719876543",
        password: "CustomerPass@123",
    },
    {
        fullName: "Kavindu Rajapaksa",
        email: "kavindu@example.com",
        phone: "+94765551234",
        password: "CustomerPass@123",
    },
];

async function seedCustomers() {
    console.log("Seeding customers...");

    for (const cust of customersToSeed) {
        const normalizedEmail = cust.email.trim().toLowerCase();
        const passwordHash = await hashPassword(cust.password);

        await db.transaction(async (tx) => {
            const [createdUser] = await tx
                .insert(users)
                .values({
                    email: normalizedEmail,
                    passwordHash,
                    role: "CUSTOMER",
                    isActive: true,
                })
                .onConflictDoNothing({ target: users.email })
                .returning({ id: users.id, email: users.email });

            if (!createdUser) {
                console.log(`Skipped (already exists): ${normalizedEmail}`);
                return;
            }

            await tx.insert(customer).values({
                userId: createdUser.id,
                fullName: cust.fullName.trim(),
                phone: cust.phone || null,
            });

            console.log(`Created customer: ${cust.fullName} (${createdUser.email})`);
        });
    }

    console.log("Customer seeding complete.");
    process.exit(0);
}

seedCustomers().catch((err) => {
    console.error("Failed to seed customers:", err);
    process.exit(1);
});

