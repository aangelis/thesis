import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

// info on how to use layouts
// https://nextjs.org/docs/basic-features/layouts
export default function Profile() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  return (
    <Layout>
      <h1>Προφίλ</h1>
      <h2>
        Profile data of logged in user
      </h2>
      {user && (
        <>
          <p style={{ fontStyle: "italic" }}>
            User {user.first_name} {user.last_name}
          </p>

          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}

    </Layout>
  );
}