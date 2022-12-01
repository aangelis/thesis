import React, { useState } from "react";
import useUser from "lib/useUser";
import Layout from "components/Layout";
import Form from "components/LoginForm";
import fetchJson, { FetchError } from "lib/fetchJson";

export default function Login() {
  // check if user is already logged in and redirect to deposits
  // const { user } = useUser();
  // console.log(user);
  // const redirectTo: string = 
  //   (user?.isAdmin || user?.isSecretary || user?.isLibrarian)? "/deposits" : "/mydeposits";
  const { mutateUser } = useUser({
    redirectTo: "/profile",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");

  return (
    <Layout>
        <Form
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();

            const body = {
              email: event.currentTarget.email.value,
              password: event.currentTarget.password.value,
            };

            try {
              mutateUser(
                await fetchJson("/api/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                }),
                false,
              );
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
            }
          }}
        />
    </Layout>
  );
}