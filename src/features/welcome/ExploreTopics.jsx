"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { topics, categories } from "./topics";
import { TopicIcon } from "./TopicIcon";
import { exploreStyles as s } from "./style";

export function ExploreTopics() {
  const [category, setCategory] = useState("All topics");
  const [query, setQuery] = useState("");
  const matches = topics.filter(
    (topic) =>
      (category === "All topics" || category === topic.category) &&
      `${topic.title} ${topic.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <div className={s.page}>
      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-primary">
        A starting point for your curiosity
      </p>
      <h1 className={s.heading}>There’s a whole world to understand.</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        Follow a familiar interest or take an unexpected turn. Every topic is a
        chance to see something differently.
      </p>
      <div className="relative mt-7 max-w-sm">
        <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
        <Input
          aria-label="Search suggested topics"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find your next idea…"
          className="h-10 rounded-xl border-border bg-card pl-10 text-sm"
        />
      </div>
      <div className={s.filters} role="group" aria-label="Filter topics">
        {categories.map((item) => (
          <Button
            key={item}
            variant="ghost"
            size="sm"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              "h-8 rounded-lg px-3 text-xs",
              category === item
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground",
            )}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="grid gap-x-10 sm:grid-cols-2 lg:gap-x-14">
        {matches.map((topic) => (
          <Link
            href={`/?topic=${encodeURIComponent(topic.prompt)}`}
            className={s.topic}
            key={topic.title}
          >
            <div className="flex items-center justify-between">
              <TopicIcon
                name={topic.icon}
                className="size-5 text-primary/85"
                strokeWidth={1.4}
              />
              <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <h2 className="mt-5 text-[15px] font-medium tracking-tight group-hover:text-primary">
              {topic.title}
            </h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {topic.description}
            </p>
            <div className="mt-5 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>{topic.category}</span>
              <span className="size-0.5 rounded-full bg-current" />
              <span className="flex items-center gap-1">
                <Clock3 className="size-3" />
                About 2 min
              </span>
            </div>
          </Link>
        ))}
      </div>
      {!matches.length && (
        <p
          role="status"
          className="py-16 text-center text-sm text-muted-foreground"
        >
          No suggestions match. You can still ask Braynix about any topic from
          New Lesson.
        </p>
      )}
      <p className="mt-8 text-xs text-muted-foreground">
        These are topic suggestions. Your lesson is generated when you select
        Start learning.
      </p>
    </div>
  );
}
