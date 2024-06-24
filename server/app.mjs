import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4002;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.get("/assignments", async (req, res) => {
  let result;
  try {
    result = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  return res.status(200).json({
    data: result.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  let result;
  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id=$1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }

  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment ( assignment id: ${assignmentIdFromClient})`,
    });
  }

  return res.status(200).json({
    data: result.rows[0],
  });
});

app.post("/assignments", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  if (!newPost.title || !newPost.content || !newPost.category) {
    return res.status(400).json({
      message:
        "Server could not create assignment because there are missing data from client.",
    });
  }

  try {
    await connectionPool.query(
      `
    insert into assignments (title, content, category, length, user_id, status, created_at, updated_at, published_at )
    values($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        newPost.title,
        newPost.content,
        newPost.category,
        newPost.length,
        1,
        newPost.status,
        newPost.created_at,
        newPost.updated_at,
        newPost.published_at,
      ]
    );
    return res.status(201).json({
      message: "Created assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updateAssignment = { ...req.body };

  let result;
  try {
    result = await connectionPool.query(
      `
    update assignments
    set title = $2,
        content = $3,
        category = $4
    where assignment_id = $1
    returning *
    `,
      [
        assignmentIdFromClient,
        updateAssignment.title,
        updateAssignment.content,
        updateAssignment.category,
      ]
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    return res.status(200).json({
      message: "Updated assignment sucessfully",
    });
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  let result;
  try {
    result = await connectionPool.query(
      `
    delete from assignments where assignment_id = $1 returning *
    `,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  if (!result.rows[0]) {
    return res.status(404).json({
      message: `Server could not find a requested assignment to delete ( assignment id: ${assignmentIdFromClient})`,
    });
  }

  return res.status(200).json({
    message: "Deleted assignment successfully",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
