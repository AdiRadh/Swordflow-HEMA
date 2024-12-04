import type {
  ActionFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { createUserSession, getUserId } from "~/session.server";
import { createUser, getProfileByEmail, getProfileByUsername } from "~/models/user.server";
import { validateEmail } from "~/utils";
import * as React from "react";
import { createImage } from "~/models/image.server";

export const meta: MetaFunction = () => {
  return [{
    title: "Sign Up",
  }];
};

interface ActionData {
  errors: {
    username?: string;
    email?: string;
    password?: string;
    image?: string;
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const username = formData.get("username");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");
  const image = formData.get("image");


  // Ensure the email is valid
  if (!validateEmail(email)) {
    return json<ActionData>(
      {
        errors: {
          email: "Email is invalid."
        }
      },
      { status: 400 }
    );
  }

  // Ensure the username is valid
  if (typeof (username) !== "string") {
    return json<ActionData>(
      { errors: { username: "Username is invalid." } },
      { status: 400 }
    );
  }
  // What if a user sends us a password through other means than our form?
  if (typeof password !== "string") {
    return json(
      { errors: { password: "Valid password is required." } },
      { status: 400 }
    );
  }

  // Enforce minimum password length
  if (password.length < 6) {
    return json<ActionData>(
      {
        errors: {
          password: "Password is too short.",
          username: undefined
        }
      },
      { status: 400 }
    );
  }

  // A user could potentially already exist within our system
  // and we should communicate that well
  const existingUser = await getProfileByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      {
        errors: {
          email: "A user already exists with this email.",
          username: undefined
        }
      },
      { status: 400 }
    );
  }

  // A user could potentially already exist within our system
  // and we should communicate that well
  const checkUsername = await getProfileByUsername(username);
  if (existingUser) {
    return json<ActionData>(
      {
        errors: {
          email: "That username already exists.",
          username: undefined
        }
      },
      { status: 400 }
    );
  }

  const user = await createUser(email, password, username);

  try {
    if(image != null && image instanceof File) {
      const uploadResult = await createImage({ name: `${username}-profile`, description: "Profile Image", userId: user?.id, type: "profile", imageFile: image });
    }
  } catch (error) {
    return json<ActionData>(
      { errors: { image: "Failed to upload video." } },
      { status: 500 }
    );
  }

  return createUserSession({
    request,
    userId: user?.id,
    remember: false,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;

  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);
  const usernameRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const imageRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef?.current?.focus();
    }
    if (actionData?.errors?.username) {
      usernameRef?.current?.focus();
    }

    if (actionData?.errors?.password) {
      passwordRef?.current?.focus();
    }

    if (actionData?.errors?.image) {
      imageRef?.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form className="space-y-6" method="post" noValidate>
          <div>
            <label className="text-sm font-medium" htmlFor="email">
              <span className="block text-amber">Email Address</span>
              {actionData?.errors?.email && (
                <span className="block pt-1 text-red" id="email-error">
                  {actionData?.errors?.email}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-amber px-2 py-1 text-lg"
              type="email"
              name="email"
              id="email"
              required
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              ref={emailRef}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="username">
              <span className="block text-amber">Username</span>
              {actionData?.errors?.username && (
                <span className="block pt-1 text-red" id="username-error">
                  {actionData?.errors?.username}
                </span>
              )}
            </label>
            <input
              className="w-full rounded border border-amber px-2 py-1 text-lg"
              type="text"
              name="username"
              id="username"
              required
              aria-invalid={actionData?.errors?.username ? true : undefined}
              aria-describedby="username-error"
              ref={usernameRef}
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="password">
              <span className="block text-amber">Password</span>
              <span className="block font-light text-amber">
                Must have at least 6 characters.
              </span>
              {actionData?.errors?.password && (
                <span className="pt-1 text-red" id="password-error">
                  {actionData?.errors?.password}
                </span>
              )}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full rounded border border-amber px-2 py-1 text-lg"
              autoComplete="new-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              ref={passwordRef}
            />
          </div>
          <label className="text-sm font-medium" htmlFor="image">
            <span className="block text-mustard">Image File (Not larger than 200MB)</span>
            {actionData?.errors?.image && (
              <span className="block pt-1 text-red" id="image-error">
                {actionData?.errors?.image}
              </span>
            )}
          </label>
          <input
            className="w-full rounded border border-mustard px-2 py-1 text-lg"
            type="file"
            name="image"
            id="image"
            aria-invalid={actionData?.errors?.image ? true : undefined}
            aria-describedby="image-error"
            ref={imageRef}
          />
          <button
            className="w-full rounded bg-amber py-2 px-4 text-white hover:mustard focus:amber"
            type="submit"
          >
            Create Account
          </button>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-amber">
              Already have an account?{" "}
              <Link
                className="text-amber underline"
                to={{
                  pathname: "/login",
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
