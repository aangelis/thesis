import Link from "next/link";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Image from "next/image";
import fetchJson from "lib/fetchJson";

export default function Header() {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  return (
    <header>
      <nav>
        <ul>

          {user?.isLoggedIn === false && (
            <>
              <li>
                <Link href="/">
                  <a>Κεντρική σελίδα</a>
                </Link>
              </li>
              
              <li>
                <Link href="/login">
                  <a>Είσοδος</a>
                </Link>
              </li>
            </>
          )}
          {user?.isLoggedIn === true && user?.is_superuser === true && (
            <>
              <li>
                <Link href="/deposits">
                  <a>
                    <span
                      style={{
                        marginRight: ".3em",
                        verticalAlign: "middle",
                        borderRadius: "100%",
                        overflow: "hidden",
                      }}
                    >

                    </span>
                    Αποθέσεις
                  </a>
                </Link>
              </li>
              </>
          )}
          {user?.isLoggedIn === true && user?.isAdmin === true && (
            <>
              <li>
                <Link href="/usersroles">
                  <a>
                    <span
                      style={{
                        marginRight: ".3em",
                        verticalAlign: "middle",
                        borderRadius: "100%",
                        overflow: "hidden",
                      }}
                    >

                    </span>
                    Ρόλοι χρηστών
                  </a>
                </Link>
              </li>
              </>
          )}
          {user?.isLoggedIn === true && user?.isSecretary === true && (
            <>
              <li>
                <Link href="/depositpermission">
                  <a>
                    <span
                      style={{
                        marginRight: ".3em",
                        verticalAlign: "middle",
                        borderRadius: "100%",
                        overflow: "hidden",
                      }}
                    >

                    </span>
                    Δικαιώματα αυτοαπόθεσης
                  </a>
                </Link>
              </li>
            </>
          )}
          {user?.isLoggedIn === true && user?.is_superuser === false && (
            <>
              <li>
              <Link href="/deposits">
                <a>
                  <span
                    style={{
                      marginRight: ".3em",
                      verticalAlign: "middle",
                      borderRadius: "100%",
                      overflow: "hidden",
                    }}
                  >

                  </span>
                  Οι αποθέσεις μου
                </a>
              </Link>
              </li>
            </>
          )}
          {user?.isLoggedIn === true && (
            <>
              <li>
                <Link href="/profile">
                  <a>
                    <span
                      style={{
                        marginRight: ".3em",
                        verticalAlign: "middle",
                        borderRadius: "100%",
                        overflow: "hidden",
                      }}
                    >

                    </span>
                    Προφίλ
                  </a>
                </Link>
              </li>

              <li>
                {/* In this case, we're fine with linking with a regular a in case of no JavaScript */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/api/logout"
                  onClick={async (e) => {
                    e.preventDefault();
                    mutateUser(
                      await fetchJson("/api/logout", { method: "POST" }),
                      false,
                    );
                    router.push("/login");
                  }}
                >
                  Αποσύνδεση
                </a>
              </li>
            </>
          )}
          <li>
            <a href="https://github.com/vvo/iron-session">
            </a>
          </li>
        </ul>
      </nav>
      <style jsx>{`
        ul {
          display: flex;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }
        li {
          margin-right: 1rem;
          display: flex;
        }
        li:first-child {
          margin-left: auto;
        }
        a {
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
        }
        a img {
          margin-right: 1em;
        }
        header {
          padding: 0.2rem;
          color: #fff;
          background-color: #333;
        }
      `}</style>
    </header>
  );
}