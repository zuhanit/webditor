"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen flex-col gap-2">
      <header className="flex w-full flex-col items-center justify-center gap-2">
        <h1 className="text-peach text-4xl font-bold">Webditor</h1>
        <p className="text-lg">
          A modern Starcraft usemap editor built for mappers.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/editor">Get Started</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/about">Learn More</Link>
          </Button>
        </div>
      </header>
      <main>
        <section className="flex items-center justify-center gap-2">
          <Card>
            <CardContent>
              <CardHeader>
                <Image
                  src="/images/editor_image.png"
                  alt="Editor Image"
                  placeholder="blur"
                  blurDataURL="/images/editor_image.png"
                  width={1000}
                  height={600}
                />
              </CardHeader>
              <p>Editor Preview</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
