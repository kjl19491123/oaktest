import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Low, JSONFile } from 'https://cdn.skypack.dev/lowdb';
const env = Deno.env.toObject();
const PORT = Number(env.PORT) || 8000;
const HOST = env.HOST || "localhost";

/* interface Course {
  title: string;
  author: string;
  rating: number;
}

let courses: Array<Course> = [
  {
    title: "Chatbots",
    author: "Jana Bergant",
    rating: 9,
  },
  {
    title: "Google Assistant app",
    author: "Jana Bergant",
    rating: 8,
  },
  {
    title: "Blog with Jekyll",
    author: "Jana Bergant",
    rating: 8,
  },
]; */

const adapter = new JSONFile('./db.json');
const db = new Low(adapter);
await db.read();
let courses = db.data.courses;

export const getCourses = ({ response }: { response: any }) => {
  response.body = courses;
};

export const getCourse = ({
  params,
  response,
}: {
  params: {
    title: string;
  };
  response: any;
}) => {
  const course = courses.filter((course) => course.title === params.title);
  if (course.length) {
    response.status = 200;
    response.body = course[0];
    return;
  }

  response.status = 400;
  response.body = { msg: `Cannot find course ${params.title}` };
};

export const addCourse = async ({
  request,
  response,
}: {
  request: any;
  response: any;
}) => {
  const body = await request.body();
  const course: Course = await body.value;
  courses.push(course);
  await db.write();
  response.body = { msg: "OK" };
  response.status = 200;
};

export const updateCourse = async ({
  params,
  request,
  response,
}: {
  params: {
    title: string;
  };
  request: any;
  response: any;
}) => {
  const temp = courses.filter((existingDCourse) =>
    existingDCourse.title === params.title
  );
  const body = await request.body();
  const { rating }: { rating: number } = await body.value;

  if (temp.length) {
    temp[0].rating = rating;
    await db.write();
    response.status = 200;
    response.body = { msg: "OK" };
    return;
  }

  response.status = 400;
  response.body = { msg: `Cannot find course ${params.title}` };
};

export const deleteCourse = async ({
  params,
  response,
}: {
  params: {
    title: string;
  };
  response: any;
}) => {
  const lengthBefore = courses.length;
  courses = courses.filter((course) => course.title !== params.title);

  if (courses.length === lengthBefore) {
    response.status = 400;
    response.body = { msg: `Cannot find course ${params.title}` };
    return;
  }
  db.data.courses = courses;
  await db.write();
  response.body = { msg: "OK" };
  response.status = 200;
};

const router = new Router();

router
  .get("/courses", getCourses)
  .get("/courses/:title", getCourse)
  .post("/courses", addCourse)
  .put("/courses/:title", updateCourse)
  .delete("/courses/:title", deleteCourse);

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Listening on port ${PORT}...`);

await app.listen(`${HOST}:${PORT}`);