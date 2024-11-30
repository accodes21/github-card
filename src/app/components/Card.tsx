import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import Tilt from "react-parallax-tilt";
import { CardProps } from "../interface/github";
import QRCodeDiv from "../components/QRCode";

const Card = ({
  avatar_url,
  name,
  bio,
  blog,
  followers,
  created_at,
  public_repos,
  location,
  login,
  totalStars,
  totalForks,
  mostActiveDay,
  topLanguages,
  isFlipped,
  cardRef,
}: CardProps) => {
  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.25}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      transitionSpeed={1000}
      scale={1.05}
      transitionEasing="cubic-bezier(0.19, 1.0, 0.22, 1.0)"
      glareBorderRadius="0rem"
      className="relative aspect-video w-full rounded-[15px] cursor-pointer"
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
        ref={cardRef}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full backface-hidden rounded-[15px]"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="front aspect-video w-full bg-[#1e1e1e] flex shadow-2xl shadow-slate-900 dark:shadow-[#2e2e2e]">
            <div className="w-[47.5%] h-full bg-[#111] flex flex-col justify-center items-center gap-6 img-div">
              <div className="flex justify-center items-center">
                <Image
                  src="/gold-bg.png"
                  alt="gold-bg"
                  width={180}
                  height={180}
                  className="absolute gold-bg"
                />
                <Image
                  src={avatar_url}
                  alt="user-avatar"
                  width={120}
                  height={120}
                  className="relative avatar"
                />
              </div>
              <div className="w-[90%] mt-[.7rem] relative flex justify-center items-center flex-col text-white name-div">
                <h3 className="font-bold name">{name}</h3>
                <h3 className="truncate w-full text-center italic bio">
                  {bio}
                </h3>
                {blog && (
                  <Link
                    href={blog}
                    title={blog}
                    target="_blank"
                    className="text-[#deaf56] hover:text-[#d89838] hover:underline transition-colors flex justify-center items-center link"
                  >
                    <Image
                      src="/link-outlined.svg"
                      alt="link"
                      width={18}
                      height={18}
                      className="web-link"
                    />
                    Website
                  </Link>
                )}
              </div>
            </div>
            <div className="w-[5%] h-full bg-[#F7EA35] fold"></div>
            <div className="w-[47.5%] h-full text-box">
              <h2 className="title text-xl flex justify-center items-center gap-2 text-[#deaf56] font-serif font-bold">
                Your{" "}
                <Image
                  src="/github-filled.svg"
                  alt="github"
                  width={24}
                  height={24}
                  className="github"
                />{" "}
                Stats
              </h2>
              <table className="flex justify-center items-center table-fixed">
                <tbody className="grid grid-cols-2 text-white gap-x-8 font-mono">
                  <tr>
                    <td className="font-semibold">Repos</td>
                  </tr>
                  <tr>
                    <td>{public_repos}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Followers</td>
                  </tr>
                  <tr>
                    <td>{followers}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Stars</td>
                  </tr>
                  <tr>
                    <td>{totalStars}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Forks</td>
                  </tr>
                  <tr>
                    <td>{totalForks}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Active Day</td>
                  </tr>
                  <tr>
                    <td>{mostActiveDay}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Location</td>
                  </tr>
                  <tr>
                    <td className="truncate">{location?.split(",")[0]}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Created-on</td>
                  </tr>
                  <tr>
                    <td>{new Date(created_at).toISOString().split("T")[0]}</td>
                  </tr>
                </tbody>
              </table>
              <h3 className="lang text-center text-white font-sans w-[90%]">
                Top Languages{"  "}: {topLanguages}
              </h3>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="relative w-full h-full bg-[#111] text-white flex flex-col justify-center items-center shadow-2xl shadow-slate-900 dark:shadow-[#2e2e2e] rotate-y-180 backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src="/gold-bg.png"
            alt="gold-bg"
            width={144}
            height={144}
            className="absolute top-[-4rem] left-[-4rem] gold-corner-bg"
          />
          <Image
            src="/gold-bg.png"
            alt="gold-bg"
            width={144}
            height={144}
            className="absolute top-[-4rem] right-[-4rem] gold-corner-bg"
          />
          <Image
            src="/gold-bg.png"
            alt="gold-bg"
            width={144}
            height={144}
            className="absolute bottom-[-4rem] right-[-4rem] gold-corner-bg"
          />
          <Image
            src="/gold-bg.png"
            alt="gold-bg"
            width={144}
            height={144}
            className="absolute bottom-[-4rem] left-[-4rem] gold-corner-bg"
          />
          <QRCodeDiv value={`https://github.com/${login}`} />
          <h3 className="mt-2 text-xl text-[#deaf56] font-serif title">
            @{login}
          </h3>
        </div>
      </div>
    </Tilt>
  );
};

export default Card;
