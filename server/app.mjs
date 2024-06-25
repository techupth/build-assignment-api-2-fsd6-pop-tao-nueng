import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

//create assignment
app.post("/assignments/create", async (req, res) => {
  const newPost = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };

  if (!req.body.title || !req.body.content || !req.body.category) {
    return res.status(500).json({
      message:
        "Server could not create assignment because there are missing data from client",
    });
  }
  try {
    await connectionPool.query(
      `insert into assignments (title,content,category,created_at,updated_at)
      values ($1, $2, $3, $4, $5)`,
      [
        newPost.title,
        newPost.content,
        newPost.category,
        newPost.created_at,
        newPost.updated_at,
      ]
    );
  } catch (error) {
    return res.status(400).json({
      message: "Server could not create assignment because database connection",
    });
  }
  return res.status(200).json({ message: "Create assignments completed!" });
});

//get all assignments
app.get("/assignments", async (req, res) => {
  const category = req.query.category;
  let result;
  try {
    result = await connectionPool.query(
      `
      select * from assignments
      where category = $1 or $1 is null or $1 = ''`,
      [category]
    );
  } catch (error) {
    res.status(400).send("error");
  }
  return res.status(200).json({ message: "Complete", data: [...result.rows] });
});

//get data assignments with id
app.get("/assignments/:id", async (req, res) => {
  const params = +req.params.id;
  let result;

  try {
    result = await connectionPool.query(
      `select * from assignments where assignment_id = ${params}`
    );
  } catch (error) {
    console.error(error);
  }
  return res.status(200).json({ message: "complete", data: result.rows[0] });
});

//update assignments with id
app.put("/assignments/:id", async (req, res) => {
  const params = +req.params.id;
  const updatedPost = { ...req.body, updated_at: new Date() };

  try {
    await connectionPool.query(
      `
      update assignments
      set title = $2,
          content = $3,
          category = $4,
          updated_at = $5
      where assignment_id = $1
      `,
      [
        params,
        updatedPost.title,
        updatedPost.content,
        updatedPost.category,
        updatedPost.updated_at,
      ]
    );
  } catch (error) {
    console.error(error);
  }
  return res.status(200).json({ message: "complete" });
});

//delete assignments with id
app.delete("/assignments/delete/:id", async (req, res) => {
  const params = +req.params.id;
  try {
    await connectionPool.query(
      `delete from assignments where assignment_id = ${params}`
    );
  } catch (error) {
    console.log(error);
  }
  return res.status(200).send("delete assignment completed!");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
