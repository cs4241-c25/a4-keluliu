const express = require("express");
const Todo = require("../models/Todo");
const { ensureAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Function to determine task status based on due date
const determineStatus = (dueDate) => {
    console.log("🔍 Called determineStatus with dueDate:", dueDate);

    if (!dueDate || typeof dueDate !== "string") {
        console.error("❌ Invalid dueDate received:", dueDate);
        return "Unknown";
    }

    const [year, month, day] = dueDate.split("-").map(Number);
    const localDue = new Date(year, month - 1, day);
    const today = new Date();
    const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    console.log("📌 Computed Due Date:", localDue.toDateString());
    console.log("📌 Today’s Date:", localToday.toDateString());

    if (isNaN(localDue.getTime())) {
        console.error("❌ Invalid computed date:", localDue);
        return "Unknown";
    }

    if (localDue < localToday) {
        console.log("⚠️ Status: Overdue");
        return "Overdue";
    } else if (localDue.getTime() === localToday.getTime()) {
        console.log("📌 Status: Due Today");
        return "Due Today";
    } else {
        console.log("✅ Status: Upcoming");
        return "Upcoming";
    }
};

// ✅ Get all todos for the logged-in user
router.get("/", ensureAuthenticated, async (req, res) => {
    try {
        console.log("🔍 Fetching Todos for User:", req.user._id); // 🛠 DEBUG LOG
        const todos = await Todo.find({ userId: req.user._id });
        console.log("✅ Todos Found:", todos); // 🛠 DEBUG LOG
        res.status(200).json(todos);
    } catch (err) {
        console.error("❌ Error Fetching Todos:", err);
        res.status(500).json({ error: "Failed to fetch todos." });
    }
});

// ✅ Add a new todo
router.post("/add", ensureAuthenticated, async (req, res) => {
    try {
        const { description, dueDate } = req.body;
        console.log("🔍 Received Task Data:", { description, dueDate }); // ✅ Log received data

        if (!description || !dueDate) {
            console.error("❌ Missing required fields");
            return res.status(400).json({ error: "All fields are required" });
        }

        const status = determineStatus(dueDate); // ✅ Get status based on due date
        console.log("📌 Determined Status:", status); // ✅ Log calculated status

        const todo = new Todo({
            description,
            dueDate,
            status, // ✅ Assign the computed status
            creationDate: new Date(),
            userId: req.user._id,
        });

        console.log("✅ Saving Task:", todo); // ✅ Log before saving
        await todo.save();

        res.status(201).json({ success: true, message: "Task added!", todo });
    } catch (err) {
        console.error("❌ Server Error:", err);
        res.status(500).json({ error: "Failed to add todo." });
    }
});

// ✅ Update a todo (only for the logged-in user)
router.put("/update", ensureAuthenticated, async (req, res) => {
    try {
        const { id, updatedFields } = req.body;

        // Ensure user owns the task
        let task = await Todo.findOne({ _id: id, userId: req.user._id });
        if (!task) {
            return res.status(403).json({ error: "Unauthorized to edit this task" });
        }

        // Apply updates
        Object.assign(task, updatedFields);

        // If dueDate was updated, recalculate the status
        if (updatedFields.dueDate) {
            task.status = determineStatus(updatedFields.dueDate);
        }

        await task.save();
        res.status(200).json({ success: true, message: "Task updated!", task });
    } catch (error) {
        console.error("❌ Error Updating Task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// ✅ Delete a todo (only for the logged-in user)
router.delete("/delete", ensureAuthenticated, async (req, res) => {
    try {
        const todo = await Todo.findOne({ _id: req.body.id, userId: req.user._id });

        if (!todo) {
            return res.status(403).json({ error: "Unauthorized to delete this task" });
        }

        await Todo.findByIdAndDelete(req.body.id);
        console.log("✅ Task Deleted:", req.body.id); // 🛠 DEBUG LOG
        res.status(200).json(await Todo.find({ userId: req.user._id }));
    } catch (err) {
        console.error("❌ Error Deleting Task:", err);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

module.exports = router;