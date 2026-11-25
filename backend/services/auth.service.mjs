import { z } from "zod";
import { db } from "../config/db/db.mjs";
import { customer } from "../config/db/schema/schema.customers.mjs";
import { employee } from "../config/db/schema/schema.employees.mjs";
import { users } from "../config/db/schema/schema.users.mjs";
import { comparePassword, hashPassword } from "../utils/password.mjs";
import AppError from "../utils/AppError.mjs";
import { and, asc, desc, eq } from "drizzle-orm"
import { APIHelper } from "../utils/apiHelper.mjs";
import { paginationSchema } from "../utils/pagination.mjs";

const listCustomersQuerySchema = paginationSchema.extend({
    search: z.string().trim().max(150).optional(),
    isActive: z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .optional(),
}).strict();

const registerSchema = z.object({
    fullName: z.string().trim().min(1).max(150),
    email: z.string().trim().min(1).max(254).email(),
    password: z.string().min(15).refine((password) => Buffer.byteLength(password, "utf8") <= 72,
        "Password must be 72 bytes or fewer"),
    phone: z.string().trim().max(32).optional(),
}).strict();

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().max(252).email(),
    password: z.string().min(1).refine((password) => {
        return Buffer.byteLength(password, "utf-8") <= 72,
            "Password must be 72 bytes or fewer"
    })
}).strict();


export const registerUser = async (data) => {
    const { fullName, email, password, phone } = registerSchema.parse(data);
    const passwordHash = await hashPassword(password);

    return db.transaction(async (t) => {
        const [user] = await t
            .insert(users)
            .values({
                email,
                passwordHash,
                role: "CUSTOMER"
            })
            .onConflictDoNothing({ target: users.email })
            .returning({
                id: users.id,
                email: users.email,
                role: users.role,
            });

        if (!user) {
            throw new AppError("An Account with this email already exists.", 409);
        }

        await t.insert(customer).values({
            userId: user.id,
            fullName,
            phone: phone || null,
        });

        return {
            ...user,
            fullName
        }
    });
}


export const loginUser = async (data) => {
    const { email, password } = loginSchema.parse(data);

    const [user] = await db.select({
        id: users.id,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        passwordHash: users.passwordHash,
    }).from(users)

        .where(eq(users.email, email))
        .limit(1);

    if (!user || !user.isActive) {
        throw new AppError("Invalid Email or Passowrd", 401)
    }

    const passMatch = await comparePassword(password, user.passwordHash);

    if (!passMatch) {
        throw new AppError("Invalid Email or Password", 401)
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role,

    };
}

export const getCurrentUser = (auth) => {
    if (!auth) {
        throw new AppError("Please sign in.", 401);
    }

    const { id, email, role, fullName } = auth;

    return {
        id,
        email,
        role,
        fullName: fullName ?? "",
    };
};

export const listAllCustomers = async (queryString = {}) => {
    const params = listCustomersQuerySchema.parse(queryString);
    const query = db
        .select({
            id: users.id,
            fullName: customer.fullName,
            email: users.email,
            phone: customer.phone,
            isActive: users.isActive,
            createdAt: users.createdAt,
        })
        .from(customer)
        .innerJoin(users, eq(users.id, customer.userId))
        .orderBy(desc(users.createdAt), asc(users.id));

    const result = await new APIHelper(query, params, [
        eq(users.role, "CUSTOMER"),
    ])
        .search(customer.fullName)
        .filter({ isActive: users.isActive })
        .pagination();

    return {
        customers: result.rows,
        pagination: result.pagination,
    };
};


const employeeStatusSchema = z.object({
    isActive: z.boolean(),
}).strict();

const employeeIdSchema = z.string().uuid("Invalid employee ID.");

export const listAllEmployee = async (queryString = {}) => {
    const params = listCustomersQuerySchema.parse(queryString);
    const query = db
        .select({
            id: users.id,
            fullName: employee.fullName,
            email: users.email,
            isActive: users.isActive,
            createdAt: users.createdAt,
        })
        .from(employee)
        .innerJoin(users, eq(users.id, employee.userId))
        .orderBy(desc(users.createdAt), asc(users.id));

    const result = await new APIHelper(query, params, [
        eq(users.role, "EMPLOYEE"),
    ])
        .search(employee.fullName)
        .filter({ isActive: users.isActive })
        .pagination();

    return {
        employees: result.rows,
        pagination: result.pagination,
    };
};

export const setEmployeeActiveStatus = async (employeeId, body) => {
    const id = employeeIdSchema.parse(employeeId);
    const { isActive } = employeeStatusSchema.parse(body);

    const [updatedUser] = await db
        .update(users)
        .set({
            isActive,
            updatedAt: new Date(),
        })
        .where(and(eq(users.id, id), eq(users.role, "EMPLOYEE")))
        .returning({
            id: users.id,
            email: users.email,
            isActive: users.isActive,
            createdAt: users.createdAt,
        });

    if (!updatedUser) {
        throw new AppError("Employee not found.", 404);
    }

    const [profile] = await db
        .select({ fullName: employee.fullName })
        .from(employee)
        .where(eq(employee.userId, id))
        .limit(1);

    return {
        ...updatedUser,
        fullName: profile?.fullName ?? "",
    };
};